## **Database Design Prompt for Gang Run Printing System**

Create a relational database schema for a gang run printing business management system with the following requirements:

### **Core Entities and Relationships**

**1\. Paper Stocks Table**

* Store different paper types with pricing and physical properties  
* Fields needed:  
  * Unique identifier  
  * Paper name (e.g., "16pt C2S Cardstock")  
  * Base price per unit (decimal with 8 decimal places precision for micro-pricing)  
  * Shipping weight per unit (decimal, 4 decimal places)  
  * Status (active/inactive)  
  * Creation and modification timestamps

**2\. Sides Options Table**

* Define printing side configurations  
* Fields:  
  * Unique identifier  
  * Option name (e.g., "Single Sided (4/0)", "Double Sided (4/4)")  
  * Description  
  * Is default option (boolean)

**3\. Paper Stock Sides Junction Table**

* Link paper stocks to available sides options with custom multipliers  
* Fields:  
  * Paper stock ID (foreign key)  
  * Sides option ID (foreign key)  
  * Price multiplier (decimal, default 1.0)  
  * Is enabled (boolean)  
  * Composite primary key on (paper\_stock\_id, sides\_option\_id)

**4\. Coating Options Table**

* Store available coating types  
* Fields:  
  * Unique identifier  
  * Coating name (e.g., "High Gloss UV", "Matte Aqueous")  
  * Description  
  * Additional cost (if coating has flat fee)

**5\. Paper Stock Coatings Junction Table**

* Link paper stocks to their available coatings  
* Fields:  
  * Paper stock ID (foreign key)  
  * Coating ID (foreign key)  
  * Is default coating (boolean)  
  * Price adjustment (decimal, for coating-specific pricing)

**6\. Quantity Groups Table**

* Define reusable quantity sets  
* Fields:  
  * Unique identifier  
  * Group name (e.g., "Standard Quantities")  
  * Description  
  * Is active (boolean)

**7\. Quantities Table**

* Store individual quantities within groups  
* Fields:  
  * Unique identifier  
  * Quantity group ID (foreign key)  
  * Quantity value (integer)  
  * Is default (boolean)  
  * Sort order (integer)

**8\. Size Groups Table**

* Define reusable size sets  
* Fields:  
  * Unique identifier  
  * Group name (e.g., "Flyer Sizes")  
  * Description  
  * Is active (boolean)

**9\. Sizes Table**

* Store individual sizes within groups  
* Fields:  
  * Unique identifier  
  * Size group ID (foreign key)  
  * Width (decimal)  
  * Height (decimal)  
  * Display name (e.g., "4x6")  
  * Square inches (computed/stored)  
  * Is default (boolean)  
  * Sort order (integer)

**10\. Products Table**

* Define complete product configurations  
* Fields:  
  * Unique identifier  
  * Product name  
  * Product code/SKU  
  * Description  
  * Quantity group ID (foreign key)  
  * Size group ID (foreign key)  
  * Base markup percentage  
  * Is active (boolean)  
  * Creation and modification timestamps

**11\. Product Paper Stocks Junction Table**

* Link products to available paper stocks  
* Fields:  
  * Product ID (foreign key)  
  * Paper stock ID (foreign key)  
  * Is default (boolean)  
  * Custom price override (nullable)

### **Additional Considerations**

**Indexes needed:**

* Primary keys on all ID fields  
* Foreign key indexes for all relationships  
* Composite indexes on junction tables  
* Index on product SKU for fast lookups  
* Index on status/active fields for filtering

**Constraints:**

* Ensure only one default coating per paper stock  
* Ensure only one default size per size group  
* Ensure only one default quantity per quantity group  
* Ensure price multipliers are positive numbers  
* Ensure at least one sides option is enabled per paper stock

**Audit/History Requirements:**

* Consider adding created\_by, updated\_by user fields  
* Consider implementing soft deletes with deleted\_at timestamps  
* Consider price history tracking table for paper stocks

**Calculation Notes:** The final price calculation should follow this formula:

Base Price \= (paper\_stock.base\_price × size.square\_inches × quantity × sides\_option\_multiplier) \+ coating\_adjustments

**Sample Data Requirements:** Populate with initial data including:

* 6 paper stocks (as shown in the UI)  
* 4 coating options  
* 4 sides options  
* 2 quantity groups with their quantities  
* 2 size groups with their sizes

Make sure to handle decimal precision appropriately for financial calculations and implement proper foreign key relationships with CASCADE or RESTRICT rules based on business logic requirements.

