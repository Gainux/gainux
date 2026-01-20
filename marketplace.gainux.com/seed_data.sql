-- Clear existing products to avoid duplicates
TRUNCATE products CASCADE;

-- Seed Products
INSERT INTO products (name, slug, description, price, image_url, category, features, version, download_url)
VALUES
(
  'Gainux CRM Pro',
  'gainux-crm-pro',
  'A comprehensive Customer Relationship Management system designed for high-growth teams. Manage leads, deals, and contacts efficiently with our intuitive interface and powerful automation tools.',
  49.00,
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
  'Business Tools',
  '["Lead Management", "Email Integration", "Analytics Dashboard", "Automated Workflows"]',
  '2.0.0',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
),
(
  'Inventory Master',
  'inventory-master',
  'Track stock across multiple warehouses with real-time updates and automated reorder alerts. Perfect for e-commerce and retail businesses.',
  29.00,
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  'Logistics',
  '["Multi-warehouse", "Barcode Scanning", "Reporting", "Low Stock Alerts"]',
  '1.5.0',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
),
(
  'TaskFlow Ultimate',
  'taskflow-ultimate',
  'Boost team collaboration with this intuitive project management tool. Kanban boards, Gantt charts, and time tracking included.',
  19.00,
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
  'Productivity',
  '["Kanban", "Time Tracking", "Team Chat", "File Sharing"]',
  '3.1.0',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
),
(
  'DevGuard Security',
  'devguard-security',
  'Secure your applications with our advanced vulnerability scanner and real-time threat detection system.',
  99.00,
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800',
  'Developer Tools',
  '["Vulnerability Scanning", "Real-time Alerts", "API Security"]',
  '1.0.0',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
);
