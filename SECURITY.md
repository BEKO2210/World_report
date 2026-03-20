# Security Policy

## Supported Versions

The following versions of World.One are currently supported with security updates.

| Version | Supported |
|--------|-----------|
| 1.x (main branch) | ✅ |
| older versions | ❌ |

Security fixes are applied directly to the main branch.

---

## Reporting a Vulnerability

If you discover a security vulnerability in World.One, please report it responsibly.

Do NOT open a public issue for security vulnerabilities.

Instead, contact the maintainer directly:

Email: belkis.aslani@gmail.com

Please include:

• Description of the vulnerability  
• Steps to reproduce  
• Potential impact  
• Suggested fix (if available)

I will acknowledge the report within **72 hours** and work on a fix as soon as possible.

After the issue is resolved, the fix will be documented publicly.

---

## Scope

This policy covers:

• Data collection pipeline  
• API integrations  
• Frontend rendering  
• Data validation and processing  
• GitHub Actions workflows

---

## Security Principles

World.One follows several security principles:

• All external data is validated  
• XSS protection for external text inputs  
• API retries and fallback mechanisms  
• Self-healing data validation  
• Backup rotation for processed data
