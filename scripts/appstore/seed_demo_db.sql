-- Demo database for the Mac App Store screenshots.
-- Usage: dropdb --if-exists postbird_demo && createdb postbird_demo && psql postbird_demo -f scripts/appstore/seed_demo_db.sql
-- All names are invented and all emails use example.com.

CREATE TABLE products (
  id          serial PRIMARY KEY,
  sku         text NOT NULL UNIQUE,
  name        text NOT NULL,
  category    text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  in_stock    boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE products IS 'Items we sell';
COMMENT ON COLUMN products.price_cents IS 'Price in cents, tax excluded';

CREATE TABLE customers (
  id         serial PRIMARY KEY,
  full_name  text NOT NULL,
  email      text NOT NULL UNIQUE,
  country    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id          serial PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  product_id  integer NOT NULL REFERENCES products (id),
  quantity    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status      text NOT NULL DEFAULT 'pending',
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  ordered_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX orders_product_id_idx ON orders (product_id);
CREATE INDEX orders_status_ordered_at_idx ON orders (status, ordered_at DESC);
CREATE INDEX orders_metadata_gin_idx ON orders USING gin (metadata);

INSERT INTO products (sku, name, category, price_cents, in_stock) VALUES
  ('MUG-001', 'Ceramic mug',          'Kitchen',   1400, true),
  ('NTB-002', 'Dot grid notebook',    'Stationery', 1200, true),
  ('PEN-003', 'Fountain pen',         'Stationery', 3800, true),
  ('LMP-004', 'Desk lamp',            'Home',       5900, false),
  ('BAG-005', 'Canvas tote bag',      'Accessories',2200, true),
  ('TEA-006', 'Loose leaf tea, 100 g','Kitchen',    1600, true),
  ('CLK-007', 'Wall clock',           'Home',       4500, true),
  ('PLT-008', 'Plant pot, large',     'Home',       2900, true);

INSERT INTO customers (full_name, email, country, created_at) VALUES
  ('Anna Lindqvist',  'anna.lindqvist@example.com',  'Sweden',        now() - interval '120 days'),
  ('Marco Bellini',   'marco.bellini@example.com',   'Italy',         now() - interval '98 days'),
  ('Priya Raman',     'priya.raman@example.com',     'India',         now() - interval '85 days'),
  ('Tomas Novak',     'tomas.novak@example.com',     'Czechia',       now() - interval '70 days'),
  ('Lena Fischer',    'lena.fischer@example.com',    'Germany',       now() - interval '61 days'),
  ('Ethan Brooks',    'ethan.brooks@example.com',    'United States', now() - interval '44 days'),
  ('Sofia Alvarez',   'sofia.alvarez@example.com',   'Spain',         now() - interval '30 days'),
  ('Kenji Tanaka',    'kenji.tanaka@example.com',    'Japan',         now() - interval '18 days'),
  ('Maya Okafor',     'maya.okafor@example.com',     'Nigeria',       now() - interval '9 days'),
  ('Oliver Grant',    'oliver.grant@example.com',    'Canada',        now() - interval '2 days');

INSERT INTO orders (customer_id, product_id, quantity, status, metadata, ordered_at)
SELECT
  1 + (g % 10),
  1 + (g % 8),
  1 + (g % 3),
  (ARRAY['pending','paid','shipped','shipped','delivered','delivered','refunded'])[1 + (g % 7)],
  jsonb_build_object(
    'channel',  (ARRAY['web','mobile','marketplace'])[1 + (g % 3)],
    'gift',     (g % 5 = 0),
    'shipping', jsonb_build_object(
      'method',   (ARRAY['standard','express','pickup'])[1 + (g % 3)],
      'tracking', 'TRK' || lpad((100000 + g * 37)::text, 7, '0')
    ),
    'tags',     CASE WHEN g % 4 = 0 THEN '["priority","gift-wrap"]'::jsonb ELSE '["standard"]'::jsonb END
  ),
  now() - (g * interval '7 hours')
FROM generate_series(1, 60) AS g;

ANALYZE;
