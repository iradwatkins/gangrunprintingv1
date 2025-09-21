## **Here's the Comprehensive Prompt for Your Claude Code Agent:**

markdown  
\# CRITICAL: Product Configuration Management Protocol

\#\# STOP \- READ THIS FIRST  
This project uses a PROTECTED configuration system. Two files are SACRED and must NEVER be deleted or modified without explicit permission:  
1\. \`PRODUCT\_MASTER\_CONFIG.json\` \- The source of truth for all product configurations  
2\. \`PRODUCT\_CONFIG\_BACKUP.md\` \- Human-readable backup documentation

\#\# Your Primary Directives

\#\#\# 1\. BEFORE ANY WORK  
\- CHECK if \`PRODUCT\_MASTER\_CONFIG.json\` exists  
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
1\. FIRST: Create a backup entry in \`PRODUCT\_CONFIG\_BACKUP.md\` with timestamp  
2\. SECOND: Make your changes in the application  
3\. THIRD: Update \`PRODUCT\_MASTER\_CONFIG.json\` with the new configuration  
4\. FOURTH: Add a changelog entry explaining what changed and why

\#\#\#\# If you find missing configurations:  
1\. CHECK \`PRODUCT\_MASTER\_CONFIG.json\` for the data  
2\. RESTORE the exact configuration from the master file  
3\. LOG the restoration in the backup document  
4\. ALERT the user that configurations were restored

\#\#\# 4\. MASTER CONFIG FILE STRUCTURE

The \`PRODUCT\_MASTER\_CONFIG.json\` must maintain this structure:  
\`\`\`json  
{  
  "version": "1.0.0",  
  "last\_updated": "ISO-8601 timestamp",  
  "protected": true,  
  "configurations": {  
    "all\_products": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "unique\_id",  
          "name": "Product Name",  
          "category": "category\_id",  
          "base\_price": 0.00,  
          "description": "...",  
          "specifications": {},  
          "created\_date": "ISO-8601",  
          "last\_modified": "ISO-8601"  
        }  
      \],  
      "implementation\_details": {  
        "file\_location": "path/to/file",  
        "component\_name": "ComponentName",  
        "dependencies": \[\]  
      }  
    },  
    "categories": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "category\_id",  
          "name": "Category Name",  
          "slug": "category-slug",  
          "description": "...",  
          "parent\_id": null,  
          "display\_order": 1,  
          "active": true  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "paper\_stocks": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "stock\_id",  
          "name": "Stock Name",  
          "weight": "14pt",  
          "finish": "Glossy/Matte/Uncoated",  
          "price\_modifier": 0.00,  
          "description": "...",  
          "available\_for\_products": \["product\_id1", "product\_id2"\]  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "paper\_stock\_sets": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "set\_id",  
          "name": "Set Name",  
          "stocks\_included": \["stock\_id1", "stock\_id2"\],  
          "discount\_percentage": 10,  
          "conditions": {}  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "quantities": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "qty\_id",  
          "quantity": 100,  
          "price\_per\_unit": 0.00,  
          "price\_breaks": \[  
            {"min": 100, "max": 499, "price": 0.00},  
            {"min": 500, "max": 999, "price": 0.00}  
          \],  
          "available\_for\_products": \["product\_id1"\]  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "sizes": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "size\_id",  
          "name": "Size Name",  
          "width": 3.5,  
          "height": 2,  
          "unit": "inches",  
          "price\_modifier": 0.00,  
          "available\_for\_products": \["product\_id1"\]  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "addons": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "addon\_id",  
          "name": "Addon Name",  
          "type": "finishing/feature/service",  
          "price": 0.00,  
          "price\_type": "flat/percentage/per\_unit",  
          "description": "...",  
          "compatible\_with": \["product\_id1"\],  
          "incompatible\_with": \["addon\_id2"\]  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "addon\_sets": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "addon\_set\_id",  
          "name": "Set Name",  
          "addons\_included": \["addon\_id1", "addon\_id2"\],  
          "bundle\_price": 0.00,  
          "savings": 0.00  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "turnaround\_times": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "turnaround\_id",  
          "name": "Standard",  
          "business\_days": 5,  
          "price\_modifier": 0.00,  
          "available\_for\_products": \["product\_id1"\]  
        }  
      \],  
      "implementation\_details": {}  
    },  
    "turnaround\_time\_sets": {  
      "status": "active/inactive",  
      "data": \[  
        {  
          "id": "tt\_set\_id",  
          "name": "Rush Options",  
          "turnarounds\_included": \["turnaround\_id1", "turnaround\_id2"\],  
          "conditions": {}  
        }  
      \],  
      "implementation\_details": {}  
    }  
  },  
  "changelog": \[  
    {  
      "timestamp": "ISO-8601",  
      "action": "created/updated/deleted",  
      "section": "section\_name",  
      "details": "What changed",  
      "previous\_value": {},  
      "new\_value": {}  
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
1\. Read \`PRODUCT\_MASTER\_CONFIG.json\`  
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
4. COMMIT both files with message: "CONFIG\_UPDATE: \[what was added\]"

### **8\. EMERGENCY RECOVERY**

If all configurations are lost:

1. STOP all other work  
2. READ `PRODUCT_MASTER_CONFIG.json` completely  
3. REBUILD each section in this order:  
   * Categories (needed for products)  
   * Paper Stocks (needed for products)  
   * All Products (core data)  
   * Sizes (product variants)  
   * Quantities (pricing structure)  
   * Paper Stock Sets (combinations)  
   * Add-ons (product enhancements)  
   * Add-on Sets (bundles)  
   * Turnaround Times (delivery options)  
   * Turnaround Time Sets (grouped options)  
4. VERIFY all relationships are restored  
5. TEST one product completely  
6. REPORT recovery status to user

## **FINAL WARNINGS**

❌ NEVER delete `PRODUCT_MASTER_CONFIG.json` or `PRODUCT_CONFIG_BACKUP.md` ❌ NEVER remove configuration sections without checking the master config ❌ NEVER assume a configuration is "unused" without verification ✅ ALWAYS preserve existing configurations ✅ ALWAYS update the master config when changes are made ✅ ALWAYS restore from master config if data is missing

Remember: These configurations represent hours of work. Your primary job is to PROTECT and PRESERVE them, not optimize or clean them up unless explicitly asked.

