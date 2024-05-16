# SmartData (第二阶段)

## 整体目标:
> 说明: 本阶段不涉及用户、权限、登录相关特性对接
1. `数据模型`相关特性对接至自建服务
2. `菜单目录`相关特性对接至自建服务
3. 前端体验优化
4. 支持单机部署

-------------------------------------------------------------------------------

### 场景拆分:

#### 1. 数据模型接口对接 (**?人日**)
   > 目标: `数据模型`相关特性对接至自建服务 (Meta, Data)
   1. 表数据操作接口 `10个`, 预计至少实现其中 `10个`
   2. 表结构操作接口 `25个`, 预计至少实现其中 `9个`
   3. 数据导入接口

#### 2. 菜单目录接口对接 (**?人日**)
   > 目标: `菜单目录`相关特性对接至自建服务 (Base, Project)
   1. 菜单相关接口 `21个`, 预计至少实现其中 `3个`

#### 3. 前端功能
   > 目标: 完善操作体验、报错重试等逻辑，提供可被外部嵌入的独立页面
   1. 模型树增加: 全选、反选 (**1**)
      > 完成
   2. 生成结果失败时自动重试 3 次 (**2**)
      > 完成
   3. 单独提供`数据导入`页 (**2**)
   4. 单独提供`数据查看`页 (**5**)
   5. 单独提供`现有模型训练`页, 管理员主动触发 (**2**)
      > 接口: 完成, 页面: 完成, 未部署
   6. 发布模型时可设置: 定时更新, 实时获取
      > 前端: 完成, 接口: 未提供
   7. 发布模型时可选择发布至现有模型 (**3**)
   8. VSQL层面的报错不需要/repair (**1**)
   9. 多语言翻译完善 (**1**)  
      > 进行中

#### 4. Docker 部署
   > 目标: 把前后端两个服务打包在一起，生成独立的部署包
   1. 把前端的请求都按标准封装到 Nuxt 的后台 (**3**)
      > 进行中
   2. 生成 Docker 部署包 (**3**)
   3. 服务闪退问题

-------------------------------------------------------------------------------

## 接口实现

### 进入: 项目 (查看)
   - 🟢️ List Projects `/api/v1/db/meta/projects` **完成**
   - 🟢 Get command palette suggestions `/api/v1/db/meta/audits/comments`**完成**
   - 🟢 Get User Info `/api/v1/auth/user/me` **完成**
   - 🟢 Get Base `/api/v1/db/meta/projects/{baseId}` **完成**
   - 🟢 Get User Info `/api/v1/auth/user/me?base_id=` **完成**
   - 🟢 List Tables `/api/v1/db/meta/projects/{baseId}/tables` **完成**
   - 🟢 List Base Users `/api/v1/db/meta/projects/{baseId}/users` **完成**

### 进入: 表格 (查看)
   - 🟢 Read Table `/api/v1/db/meta/tables/{tableId}` **完成**
   - 🟢 List Views `/api/v1/db/meta/tables/{tableId}/views` **完成**
   - 🟢 List Columns In View `/api/v1/db/meta/views/{viewId}/columns` **完成**
   - 🟢️ List Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}` **完成**
   - 🟡️ Get View Filter `/api/v1/db/meta/views/{viewId}/filters` **模拟返回**
   - 🟡️ List View Sorts `/api/v1/db/meta/views/{viewId}/sorts` **模拟返回**

### 编辑: 表格数据
   - 🟢️ Update Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-update` **完成**
   - 🟢️️ Delete Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-delete` **完成**
   - 🟢️️ List Table Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-list` **完成**
   - ⚪️ Create Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-create` **未开始**
   - 🟢 Update Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-update` **完成**
   - 🟢️ Delete Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-delete` **完成**
   - 🟢️️ Bulk Update Table Rows by IDs `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-update` **完成**
   - 🟢 Bulk Delete Table Rows by IDs `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-delete` **完成**
   - 🟢️ Create Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-create` **完成**
   - 🟢 Get Table View Row `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-read` **完成**
   - 🟢 Count Table View Rows `https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-count` **完成**

### 编辑: 表格结构
   - 🟢️ Delete Column `/api/v1/db/meta/columns/{columnId}` **完成**
   - 🟡️ Update Column `/api/v1/db/meta/columns/{columnId}` **完成: 部分类型**
   - 🟡 Create Column `/api/v1/db/meta/tables/{tableId}/columns` **完成: 部分类型**
   - ⚪️ Create Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-create` **未开始**
   - ⚪️ Update Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-update` **未开始**
   - ⚪️ Delete Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-delete` **未开始**
   - ⚪️ Duplicate Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-duplicate` **未开始**
   - ⚪️ Duplicate Column `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/duplicate-column` **未开始**
   - ⚪️ Reorder Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-reorder` **未开始**
   - ⚪️ Update Grid Column `https://meta-apis-v1.nocodb.com/#tag/DB-View/operation/db-view-grid-column-update` **未开始**

### 显示: 排序&过滤
   - ⚪️ List View Sorts
   - ⚪️ Update View Sort
   - ⚪️ Get Sort
   - ⚪️ Update Sort
   - ⚪️ Delete Sort

## 5.15
   > 正式环境: http://smartdata.yindangu.com
   > 测试环境: http://smartdata-server.yindangu.com

### 前端
   - 【进行中】屏蔽部分未支持的字段类型
   - 【进行中】表格可按目录分类
   - 【进行中】排序接口对接
   - 【未启动】excel 导入
   - 【完成】请求 LLM 接口时使用代理

### 平台
   - 【暂缓】V: 前端导出规则不要把隐藏的字段也导出来 (项目不急)

### 后端
1. 生成 DDL 接口-调整 （2024-04-28）
   - a.【完成】物理表名调整为模型名

2. SQL 查询接口-调整
   - a.【完成】SQL 中表名接受模型名（2024-04-28）
   - b.【完成】对于模型名重复的，支持结合传入的企业 ID，项目标识进行唯一定位（2024-04-28）
   - c.【进行中】查询结果集中支持追溯结果集列的来源物理表字段，得到字段中文名，返回到列元信息中（五一后）
   - d.【完成】查询结果集中空列名的兜底处理（2024-04-29）

3. 模型发布&保存接口-调整（2024-04-30）
   - a.【完成】支持删除模型表的发布功能

4. 模型复制接口-新实现（2024-04-30）
   - a.【完成】支持模型的复制
   - b.支持模型复制的物理表结构发布
   - c.支持模型复制的物理表数据复制
