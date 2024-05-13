## meta
> https://meta-apis-v1.nocodb.com

### Auth
- ⚪️ Signup
- ⚪️ Signout
- ⚪️ Signin
- 🟢 Get User Info `/api/v1/auth/user/me`
- ⚪️ Forget Password
- ⚪️ Change Password
- ⚪️ Verify Reset Token
- ⚪️ Verify Email
- ⚪️ Reset Password
- ⚪️ Refresh Token
- 🟢 List Base Users `/api/v1/db/meta/projects/{baseId}/users`
- ⚪️ Create Base User
- ⚪️ Update Base User
- ⚪️ Delete Base User
- ⚪️ Resend User Invitation

### Base
- ⚪️ Get Base info
- ⚪️ Get UI ACL
- ⚪️ Create UI ACL
- 🟢️ List Projects `/api/v1/db/meta/projects`
- ⚪️ Create Base
- ⚪️ Duplicate Base Source
- ⚪️ Duplicate Base
- 🟢 Get Base `/api/v1/db/meta/projects/{baseId}`
- ⚪️ Delete Base
- ⚪️ Update Base
- ⚪️ Base user meta update
- ⚪️ Get Base Shared Base
- ⚪️ Delete Base Shared Base
- ⚪️ Create Base Shared Base
- ⚪️ Update Base Shared Base
- ⚪️ Base Cost
- ⚪️ Sync Meta
- ⚪️ Meta Diff
- ⚪️ List Empty & Null Filter
- ⚪️ List Audits in Base

### DB Table
- ⚪️ Create Table
- 🟢 List Tables `/api/v1/db/meta/projects/{baseId}/tables`
- 🟢 Read Table `/api/v1/db/meta/tables/{tableId}`
- ⚪️ Update Table
- ⚪️ Delete Table
- ⚪️ Duplicate Table
- ⚪️ Duplicate Column
- ⚪️ Reorder Table

### DB Table Column
- ⚪️ Create Column `/api/v1/db/meta/tables/{tableId}/columns`
- ⚪️ Update Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Delete Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Get Column
- ⚪️ Create Primary Value
- ⚪️ Get columns hash for table
- ⚪️ Bulk create-update-delete columns

### DB View
- 🟢 List Views `/api/v1/db/meta/tables/{tableId}/views`
- ⚪️ Update View
- ⚪️ Delete View
- ⚪️ Show All Columns In View
- ⚪️ Hide All Columns In View
- ⚪️ Create Grid View
- ⚪️ Create Form View
- ⚪️ Update Form View
- ⚪️ Get Form
- ⚪️ Update Form Column
- ⚪️ Update Grid View
- ⚪️ List Grid Columns
- ⚪️ Update Grid Column
- ⚪️ Create Gallery View
- ⚪️ Update Gallery View
- ⚪️ Get Gallery View
- ⚪️ Create Kanban View
- ⚪️ Update Kanban View
- ⚪️ Get Kanban View
- ⚪️ Create Map View
- ⚪️ Update Map View
- ⚪️ Get Map View
- ⚪️ Create Calendar View
- ⚪️ Update Calendar View
- ⚪️ Get Calendar View

### DB View Column
- 🟢 List Columns In View `/api/v1/db/meta/views/{viewId}/columns`
- ⚪️ Create Column in View
- ⚪️ Update View Column

### Utils
- ⚪️ List Comments in Audit
- ⚪️ Comment Rows
- ⚪️ Update Comment in Audit
- ⚪️ Count Comments
- ⚪️ Update Audit Row
- ⚪️ Test DB Connection
- ⚪️ utils-select-query
- ⚪️ Convert JDBC URL to Config
- ⚪️ Get App Info
- ⚪️ Axios Request
- ⚪️ Get App Version
- ⚪️ Get Application Health Status
- ⚪️ Get Aggregated Meta Info
- ⚪️ Get Cache
- ⚪️ Delete Cache
- 🟢️ Get command palette suggestions `/api/v1/db/meta/audits/comments`

### DB Table Filter
- 🟢️ Get View Filter `/api/v1/db/meta/views/{viewId}/filters`
- ⚪️ Create View Filter
- ⚪️ Get Filter
- ⚪️ Update Filter
- ⚪️ Delete Filter
- ⚪️ Get Filter Group Children

### DB Table Sort
- 🟢️ List View Sorts `/api/v1/db/meta/views/{viewId}/sorts`
- ⚪️ Update View Sort
- ⚪️ Get Sort
- ⚪️ Update Sort
- ⚪️ Delete Sort


## Data
### DB Table Row
- ⚪️ List Table Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-list`
- ⚪️ Create Table Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-create`
- ⚪️ Find One Table Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-find-one`
- ⚪️ Group By Table Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-group-by`
- ⚪️ Table Group by Column `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-grouped-data-list`
- ⚪️ Get Table Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-read`
- ⚪️ Update Table Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-update`
- ⚪️ Delete Table Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-delete`
- ⚪️ Does Table Row Exist `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-exist`
- ⚪️ Bulk Insert Table Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-create`
- ⚪️ Bulk Update Table Rows by IDs `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-update`
- ⚪️ Bulk Delete Table Rows by IDs `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-delete`
- ⚪️ Bulk Update Table Rows with Conditions `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-update-all`
- ⚪️ Bulk Delete Table Rows with Conditions `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-delete-all`
- ⚪️ Export Table View Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-csv-export`
- ⚪️ List Nested Relations Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-nested-list`
- ⚪️ Create Nested Relations Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-nested-add`
- ⚪️ Delete Nested Relations Row `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-nested-remove`
- ⚪️ Referenced Table Rows Excluding Current Record's Children / Parent `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-nested-children-excluded-list`

### DB View Row
- ⚪️ Table Group by Column
- 🟢️ List Table View Rows `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-list`
- ⚪️ Create Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-create`
- ⚪️ Find One Table View Row
- ⚪️ Group By Table View Row
- ⚪️ Count Table View Rows `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-count`
- ⚪️ Get Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-read`
- ⚪️ Update Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-update`
- ⚪️ Delete Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-delete`
- ⚪️ Does Table View Row Exist
- ⚪️ Export Table View Rows

# V2

## Data
https://data-apis-v2.nocodb.com

### Table Records
- ⚪️ List Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-list`
- ⚪️ Create Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-create`
- ⚪️ Update Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-update`
- ⚪️ Delete Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-delete`
- ⚪️ Read Table Record `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-read`
- ⚪️ Count Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-count`
- ⚪️ List Linked Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-nested-list`
- ⚪️ Link Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-nested-link`
- ⚪️ Unlink Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-nested-unlink`

## 第一阶段 (能进入表页面)

### 进入: 项目
- 🟢️ List Projects `/api/v1/db/meta/projects`
- 🟡 Get command palette suggestions `/api/v1/db/meta/audits/comments`
- 🟡 Get User Info `/api/v1/auth/user/me`
- 🟢 Get Base `/api/v1/db/meta/projects/{baseId}`
- 🟡 Get User Info `/api/v1/auth/user/me?base_id=`
- 🟢 List Tables `/api/v1/db/meta/projects/{baseId}/tables`
- 🟡 List Base Users `/api/v1/db/meta/projects/{baseId}/users`

### 进入: 表
- 🟢 Read Table `/api/v1/db/meta/tables/{tableId}`
- 🟢 List Views `/api/v1/db/meta/tables/{tableId}/views`
- 🟢 List Columns In View `/api/v1/db/meta/views/{viewId}/columns`
- 🟢️ List Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}`
- 🟡️ Get View Filter `/api/v1/db/meta/views/{viewId}/filters`
- 🟡️ List View Sorts `/api/v1/db/meta/views/{viewId}/sorts`

### 编辑: 表格数据
- 🟢 Update Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-update` **完成**
- 🟢️ Delete Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-delete` **完成**
- ⚪️ Update Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-update`
- ⚪️ Delete Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-delete`
- ⚪️ Bulk Update Table Rows by IDs `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-update`
- ⚪️ Bulk Delete Table Rows by IDs `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-delete`
- ⚪️ Create Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-create`
- ⚪️ Get Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-read`
- ⚪️ Count Table View Rows `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-count`

### 编辑: 表格结构
- ⚪️ Delete Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Update Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Create Column `/api/v1/db/meta/tables/{tableId}/columns`