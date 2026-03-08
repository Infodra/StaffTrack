const Company = require('../models/Company');

/**
 * Tenant Middleware - Extract company from subdomain
 * Supports multi-tenant architecture by identifying companies via subdomain
 * 
 * Examples:
 * - tecinfo.st.infodra.ai → tenant: tecinfo
 * - company1.st.infodra.ai → tenant: company1
 * - localhost:5000 → development mode (skips tenant check)
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    const host = req.headers.host;

    if (!host) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request host' 
      });
    }

    // Skip tenant detection for localhost and development
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // In development, look for company_id in headers or use default
      const devCompanyId = req.headers['x-company-id'] || 'TECHINFO';
      
      const company = await Company.findOne({ 
        company_id: devCompanyId.toUpperCase() 
      });

      if (company) {
        req.company = company;
        req.tenant = devCompanyId.toLowerCase();
      }
      
      return next();
    }

    // Skip tenant detection for API domain (api.st.infodra.ai)
    // Use X-Company-ID header instead for tenant identification
    if (host.startsWith('api.')) {
      const companyId = req.headers['x-company-id'];
      
      if (companyId) {
        const company = await Company.findOne({ 
          company_id: companyId.toUpperCase() 
        });

        if (company) {
          req.company = company;
          req.tenant = companyId.toLowerCase();
        }
      }
      
      return next();
    }

    // Extract subdomain from host
    // Format: tecinfo.st.infodra.ai → ['tecinfo', 'st', 'infodra', 'ai']
    const parts = host.split('.');
    
    if (parts.length < 3) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid subdomain format' 
      });
    }

    const subdomain = parts[0]; // First part is the company identifier

    // Find company by subdomain/company_id
    const company = await Company.findOne({ 
      company_id: subdomain.toUpperCase() 
    });

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: `Company not found for tenant: ${subdomain}`,
        tenant: subdomain
      });
    }

    // Check if company is active
    if (company.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: `Company account is ${company.status}`,
        tenant: subdomain
      });
    }

    // Attach company and tenant to request
    req.company = company;
    req.tenant = subdomain.toLowerCase();

    next();
  } catch (error) {
    console.error('Tenant Middleware Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error loading tenant information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = tenantMiddleware;
