## **Here's the Comprehensive Prompt for Your Claude Code Agent:**

markdown  
\# CRITICAL: Product Configuration Management Protocol

\#\# STOP \- READ THIS FIRST  
This project uses a PROTECTED configuration system. Two files are SACRED and must NEVER be deleted or modified without explicit permission:  
1\. \`PRODUCT_MASTER_CONFIG.json\` \- The source of truth for all product configurations  
2\. \`PRODUCT_CONFIG_BACKUP.md\` \- Human-readable backup documentation

\#\# Your Primary Directives

\#\#\# 1\. BEFORE ANY WORK  
\- CHECK if \`PRODUCT_MASTER_CONFIG.json\` exists  
\- READ its contents completely  
\- VERIFY all configuration sections are present in the codebase  
\- If any sections are missing, RESTORE them from the master config

\#\#\# 2\. CONFIGURATION SECTIONS TO PROTECT  
These sections contain critical business data that took significant time to create:  
\- All Products (complete product catalog)  
\- Categories (product categorization system)  
\- Paper Stocks (material options and specifications)  
\- Paper Stock Sets (predefined stock combinations)  
\- Quantities (order quantity options and pricing tiers)  
\- Sizes (dimension specifications)  
\- Add-ons (additional product features and pricing)  
\- Add-on Sets (bundled add-on packages)  
\- Turnaround Times (production timeline options)  
\- Turnaround Time Sets (grouped turnaround options)

\#\#\# 3\. WHEN MAKING CHANGES

\#\#\#\# If you need to modify any configuration:  
1\. FIRST: Create a backup entry in \`PRODUCT_CONFIG_BACKUP.md\` with timestamp  
2\. SECOND: Make your changes in the application  
3\. THIRD: Update \`PRODUCT_MASTER_CONFIG.json\` with the new configuration  
4\. FOURTH: Add a changelog entry explaining what changed and why

\#\#\#\# If you find missing configurations:  
1\. CHECK \`PRODUCT_MASTER_CONFIG.json\` for the data  
2\. RESTORE the exact configuration from the master file  
3\. LOG the restoration in the backup document  
4\. ALERT the user that configurations were restored

\#\#\# 4\. MASTER CONFIG FILE STRUCTURE

The \`PRODUCT_MASTER_CONFIG.json\` must maintain this structure:  
\`\`\`json  
{  
 "version": "1.0.0",  
 "last_updated": "ISO-8601 timestamp",  
 "protected": true,  
 "configurations": {  
 "all_products": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "unique_id",  
 "name": "Product Name",  
 "category": "category_id",  
 "base_price": 0.00,  
 "description": "...",  
 "specifications": {},  
 "created_date": "ISO-8601",  
 "last_modified": "ISO-8601"  
 }  
 \],  
 "implementation_details": {  
 "file_location": "path/to/file",  
 "component_name": "ComponentName",  
 "dependencies": \[\]  
 }  
 },  
 "categories": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "category_id",  
 "name": "Category Name",  
 "slug": "category-slug",  
 "description": "...",  
 "parent_id": null,  
 "display_order": 1,  
 "active": true  
 }  
 \],  
 "implementation_details": {}  
 },  
 "paper_stocks": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "stock_id",  
 "name": "Stock Name",  
 "weight": "14pt",  
 "finish": "Glossy/Matte/Uncoated",  
 "price_modifier": 0.00,  
 "description": "...",  
 "available_for_products": \["product_id1", "product_id2"\]  
 }  
 \],  
 "implementation_details": {}  
 },  
 "paper_stock_sets": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "set_id",  
 "name": "Set Name",  
 "stocks_included": \["stock_id1", "stock_id2"\],  
 "discount_percentage": 10,  
 "conditions": {}  
 }  
 \],  
 "implementation_details": {}  
 },  
 "quantities": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "qty_id",  
 "quantity": 100,  
 "price_per_unit": 0.00,  
 "price_breaks": \[  
 {"min": 100, "max": 499, "price": 0.00},  
 {"min": 500, "max": 999, "price": 0.00}  
 \],  
 "available_for_products": \["product_id1"\]  
 }  
 \],  
 "implementation_details": {}  
 },  
 "sizes": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "size_id",  
 "name": "Size Name",  
 "width": 3.5,  
 "height": 2,  
 "unit": "inches",  
 "price_modifier": 0.00,  
 "available_for_products": \["product_id1"\]  
 }  
 \],  
 "implementation_details": {}  
 },  
 "addons": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "addon_id",  
 "name": "Addon Name",  
 "type": "finishing/feature/service",  
 "price": 0.00,  
 "price_type": "flat/percentage/per_unit",  
 "description": "...",  
 "compatible_with": \["product_id1"\],  
 "incompatible_with": \["addon_id2"\]  
 }  
 \],  
 "implementation_details": {}  
 },  
 "addon_sets": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "addon_set_id",  
 "name": "Set Name",  
 "addons_included": \["addon_id1", "addon_id2"\],  
 "bundle_price": 0.00,  
 "savings": 0.00  
 }  
 \],  
 "implementation_details": {}  
 },  
 "turnaround_times": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "turnaround_id",  
 "name": "Standard",  
 "business_days": 5,  
 "price_modifier": 0.00,  
 "available_for_products": \["product_id1"\]  
 }  
 \],  
 "implementation_details": {}  
 },  
 "turnaround_time_sets": {  
 "status": "active/inactive",  
 "data": \[  
 {  
 "id": "tt_set_id",  
 "name": "Rush Options",  
 "turnarounds_included": \["turnaround_id1", "turnaround_id2"\],  
 "conditions": {}  
 }  
 \],  
 "implementation_details": {}  
 }  
 },  
 "changelog": \[  
 {  
 "timestamp": "ISO-8601",  
 "action": "created/updated/deleted",  
 "section": "section_name",  
 "details": "What changed",  
 "previous_value": {},  
 "new_value": {}  
 }  
 \]

}

### **5\. BACKUP DOCUMENT STRUCTURE**

The `PRODUCT_CONFIG_BACKUP.md` should be human-readable:

markdown  
\# Product Configuration Backup  
Last Updated: \[Timestamp\]

\#\# Quick Recovery Commands  
If configurations are missing, the AI agent should:  
1\. Read \`PRODUCT_MASTER_CONFIG.json\`  
2\. Restore each section using the data provided  
3\. Verify all relationships between sections are intact

\#\# Current Active Configurations

\#\#\# All Products  
Total Products: \[count\]  
Categories in Use: \[list\]  
Last Modified: \[date\]

\[List each product with key details\]

\#\#\# Categories  
Total Categories: \[count\]  
Structure: \[hierarchical/flat\]

\[List each category with products count\]

\#\#\# Paper Stocks  
Total Options: \[count\]  
Most Used: \[top 3\]

\[List each stock with specifications\]

\[Continue for each section...\]

\#\# Recovery Log  
\[Document each time configurations were restored\]

\#\# Manual Recovery Instructions

\[Step-by-step instructions for manual restoration if needed\]

### **6\. VALIDATION RULES**

Before considering any configuration section as "unused" or "deletable":

1. CHECK if it exists in `PRODUCT_MASTER_CONFIG.json`
2. VERIFY no products reference it
3. CONFIRM with user before removing
4. ARCHIVE deleted items (don't permanently delete)

### **7\. UPDATE PROTOCOL**

When new products or configurations are added:

1. ADD to the application/database
2. IMMEDIATELY update `PRODUCT_MASTER_CONFIG.json`
3. UPDATE `PRODUCT_CONFIG_BACKUP.md` with summary
4. COMMIT both files with message: "CONFIG_UPDATE: \[what was added\]"

### **8\. EMERGENCY RECOVERY**

If all configurations are lost:

1. STOP all other work
2. READ `PRODUCT_MASTER_CONFIG.json` completely
3. REBUILD each section in this order:
   - Categories (needed for products)
   - Paper Stocks (needed for products)
   - All Products (core data)
   - Sizes (product variants)
   - Quantities (pricing structure)
   - Paper Stock Sets (combinations)
   - Add-ons (product enhancements)
   - Add-on Sets (bundles)
   - Turnaround Times (delivery options)
   - Turnaround Time Sets (grouped options)
4. VERIFY all relationships are restored
5. TEST one product completely
6. REPORT recovery status to user

## **FINAL WARNINGS**

❌ NEVER delete `PRODUCT_MASTER_CONFIG.json` or `PRODUCT_CONFIG_BACKUP.md` ❌ NEVER remove configuration sections without checking the master config ❌ NEVER assume a configuration is "unused" without verification ✅ ALWAYS preserve existing configurations ✅ ALWAYS update the master config when changes are made ✅ ALWAYS restore from master config if data is missing

Remember: These configurations represent hours of work. Your primary job is to PROTECT and PRESERVE them, not optimize or clean them up unless explicitly asked.
