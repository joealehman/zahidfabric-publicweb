/*
# Replace demo fabric inventory with the supplied SAYA suit catalog

1. Product Data
- Removes the invented fabric products and their thaan/roll demo records.
- Seeds exactly the 12 SAYA stitched 3-piece lawn suit records supplied in the catalog brief.
- Stores catalog ID, SKU, colorway name, category, sub-category, retail price, GST, barcode, image path, and demo stock.
- Wholesale pricing remains NULL because the supplied source does not provide it.

2. Product Details
- Adds `catalog_id` and `gst_pkr` to products.
- Existing product columns remain for data safety but are no longer used by the SAYA presentation.
- Exact shirt, dupatta, trouser, and care details are stored in the product details array.

3. Security
- Existing RLS policies remain in place for the single-tenant prototype.

4. Important Notes
- These stock quantities are explicitly demo/placeholder inventory from the supplied brief.
- Only the supplied Royal Blue catalog page currently exists locally at `/products/image.png`.
- Other catalog image paths are stored exactly as supplied and the UI displays a neutral Product Image placeholder until those JPG files are available.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_id text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_pkr numeric;
CREATE UNIQUE INDEX IF NOT EXISTS products_catalog_id_unique ON products(catalog_id) WHERE catalog_id IS NOT NULL;

DELETE FROM inventory_movements;
DELETE FROM sale_items;
DELETE FROM thaans;
DELETE FROM sales;
DELETE FROM products;

INSERT INTO products (catalog_id, name, sku, barcode, category, fabric_type, image_path, retail_price, wholesale_price, minimum_stock, current_stock, description, details, availability, gst_pkr, unit, meters_per_thaan, thaan_count, total_meters, cost_per_meter, location)
VALUES
('U01-25019-06BR','Suit Violet','WUNS-5270-R','0167203','3 Piece','Lawn','/images/U01-25019-06BR.jpg',2999,NULL,5,18,'SAYA stitched 3-piece lawn suit in Suit Violet.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25150-08AR','Suit Beige','WUNS-5343-R','0167001','3 Piece','Lawn','/images/U01-25150-08AR.jpg',2999,NULL,5,24,'SAYA stitched 3-piece lawn suit in Suit Beige.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25150-10BR','Suit Ivory','WUNS-5348-R','0167000','3 Piece','Lawn','/images/U01-25150-10BR.jpg',2999,NULL,5,12,'SAYA stitched 3-piece lawn suit in Suit Ivory.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25154-07AR','Suit Ivory','WUNS-5356-R','0166997','3 Piece','Lawn','/images/U01-25154-07AR.jpg',2999,NULL,5,9,'SAYA stitched 3-piece lawn suit in Suit Ivory.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25160-09AR','Suit Lilac','WUNS-5430-R','0167079','3 Piece','Lawn','/images/U01-25160-09AR.jpg',2999,NULL,5,30,'SAYA stitched 3-piece lawn suit in Suit Lilac.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25162-07AR','Suit Pastel Green','WUNS-7948','0169266','3 Piece','Lawn','/images/U01-25162-07AR.jpg',2999,NULL,5,6,'SAYA stitched 3-piece lawn suit in Suit Pastel Green.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25224-03AR','Suit Cream','WUNS-5444-R','0167100','3 Piece','Lawn','/images/U01-25224-03AR.jpg',2999,NULL,5,15,'SAYA stitched 3-piece lawn suit in Suit Cream.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25268-14BR','Suit Light Turquoise','WUNS-7950','0169268','3 Piece','Lawn','/images/U01-25268-14BR.jpg',2999,NULL,5,21,'SAYA stitched 3-piece lawn suit in Suit Light Turquoise.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25268-21AR','Suit Green','WUNS-5295-R','0167500','3 Piece','Lawn','/images/U01-25268-21AR.jpg',2999,NULL,5,3,'SAYA stitched 3-piece lawn suit in Suit Green.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'Low Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25557-07BR','Suit Teal','WUNS-7953','0169269','3 Piece','Lawn','/images/U01-25557-07BR.jpg',2999,NULL,5,27,'SAYA stitched 3-piece lawn suit in Suit Teal.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25710-02BR','Suit Magenta','WUNS-6987-R','0166982','3 Piece','Lawn','/images/U01-25710-02BR.jpg',2999,NULL,5,11,'SAYA stitched 3-piece lawn suit in Suit Magenta.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL),
('U01-25710-04AR','Suit Royal Blue','WUNS-6990-R','0167553','3 Piece','Lawn','/products/image.png',2999,NULL,5,19,'SAYA stitched 3-piece lawn suit in Suit Royal Blue.',ARRAY['Shirt · Premium Printed Lawn Shirt (Wider Width) · 1.75 m','Dupatta · Premium Printed Lawn Dupatta · 2.5 m','Trouser · Premium Dyed Cambric Trouser · 1.75 m','Care: Dry clean recommended.','Care: Do not use any type of bleach or stain removing chemicals.','Care: Before stitching, fabric should be soaked in water.','Care: Wash and soak colored and white fabrics separately.'],'In Stock',457,'Set',NULL,NULL,NULL,NULL,NULL)
ON CONFLICT (sku) DO UPDATE SET
  catalog_id = EXCLUDED.catalog_id, name = EXCLUDED.name, barcode = EXCLUDED.barcode, category = EXCLUDED.category,
  fabric_type = EXCLUDED.fabric_type, image_path = EXCLUDED.image_path, retail_price = EXCLUDED.retail_price,
  wholesale_price = EXCLUDED.wholesale_price, current_stock = EXCLUDED.current_stock, description = EXCLUDED.description,
  details = EXCLUDED.details, availability = EXCLUDED.availability, gst_pkr = EXCLUDED.gst_pkr, unit = EXCLUDED.unit;
