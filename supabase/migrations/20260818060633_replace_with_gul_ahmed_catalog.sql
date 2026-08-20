/*
# Replace SAYA catalog with supplied Gul Ahmed Embroidery Lawn products

1. Product columns
- `brand` stores the supplied brand name.
- `collection` stores `Embroidery Lawn`.
- `pattern` stores each supplied pattern description.
- `product_type` stores `Three Piece`.
- `shirt_fabric`, `shirt_quantity`, `dupatta_fabric`, `dupatta_quantity`, `trouser_fabric`, `trouser_quantity` store the supplied component details.
- `add_on` stores the embroidered neck detail.
- `document_path` stores the provided local PDF attachment path.

2. Data replacement
- Removes the previous SAYA demo products, related demo stock movement rows, and related demo sales rows.
- Seeds exactly the seven supplied Gul Ahmed product codes.
- Uses PKR 6,690 for every supplied unit price.
- Uses clearly labelled demo stock quantities of 25 for each product because no actual stock was supplied.
- Leaves wholesale price NULL because no wholesale price was supplied.

3. Security
- Existing RLS policies remain in place for the single-tenant prototype.

4. Important notes
- The provided PDF is attached to each of the seven catalog records at `/products/documents/Gullahmed_emb_Lawn_3pc.pdf`.
- No product photography is invented. The UI uses a neutral product placeholder until separate product images are supplied.
- Stock values are sample inventory only and are not presented as verified business stock.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pattern text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'Three Piece';
ALTER TABLE products ADD COLUMN IF NOT EXISTS shirt_fabric text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS shirt_quantity text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dupatta_fabric text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dupatta_quantity text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS trouser_fabric text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS trouser_quantity text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS add_on text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS document_path text;

DELETE FROM inventory_movements;
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM products;

INSERT INTO products (
  catalog_id, name, sku, barcode, category, fabric_type, image_path, retail_price, wholesale_price,
  minimum_stock, current_stock, description, details, availability, gst_pkr, unit,
  brand, collection, pattern, product_type, shirt_fabric, shirt_quantity, dupatta_fabric, dupatta_quantity,
  trouser_fabric, trouser_quantity, add_on, document_path
)
VALUES
('IUSTKSD-4117','IUSTKSD-4117','IUSTKSD-4117','IUSTKSD-4117','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with floral print in peach, yellow and black.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Floral print (peach/yellow/black)','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf'),
('IUSTKSD-4111','IUSTKSD-4111','IUSTKSD-4111','IUSTKSD-4111','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with cream floral print and green border.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Cream floral with green border','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf'),
('IUSTKSD-4112','IUSTKSD-4112','IUSTKSD-4112','IUSTKSD-4112','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with brown and cream geometric print.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Brown/cream geometric print','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf'),
('IUSTKSD-4113','IUSTKSD-4113','IUSTKSD-4113','IUSTKSD-4113','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with cream floral print and red maroon detail.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Cream floral with red/maroon','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf'),
('IUSTKSD-4114','IUSTKSD-4114','IUSTKSD-4114','IUSTKSD-4114','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with dark green floral print and pink border.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Dark green floral with pink border','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf'),
('IUSTKSD-4115','IUSTKSD-4115','IUSTKSD-4115','IUSTKSD-4115','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with navy blue floral print and tan detail.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Navy blue floral with tan','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf'),
('IUSTKSD-4116','IUSTKSD-4116','IUSTKSD-4116','IUSTKSD-4116','Three Piece','Lawn','',6690,NULL,5,25,'Gul Ahmed Embroidery Lawn three piece with multicolor chevron and floral print.',ARRAY['Digital Printed Lawn Shirt · 1.85 Mtr','Digital Printed Lawn Voil Dupatta · 2.5 Mtr','Dyed Plain Cotton Trouser · 2.5 Mtr','Embroidered neck on organza','Product may vary from picture.'],'In Stock',NULL,'Set','Gul Ahmed','Embroidery Lawn','Multicolor chevron/floral','Three Piece','Digital Printed Lawn','1.85 Mtr','Digital Printed Lawn Voil','2.5 Mtr','Dyed Plain Cotton','2.5 Mtr','Embroidered neck on organza','/products/documents/Gullahmed_emb_Lawn_3pc.pdf');
