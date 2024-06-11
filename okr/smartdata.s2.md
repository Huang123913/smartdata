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
   - 🟢️️ Create Table Records `https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-create` **完成**
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
      - 1. ⚪️ 在指定位置插入 **未开始**
   - 🟢️ Create Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-create` **完成**
   - 🟢 Update Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-update` **完成**
   - 🟢️ Delete Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-delete` **完成**
   - 🟢️️ Update Grid Column (字段拖拽排序) `https://meta-apis-v1.nocodb.com/#tag/DB-View/operation/ db-view-grid-column-update` **完成**
   - ⚪️ Duplicate Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-duplicate` **未开始**
      - 1. 🟢 拷贝表结构 **完成**
      - 2. 🟢️ 拷贝表结构+数据 **完成**
      - 3. ⚪️ 拷贝数据
   - 🟡 Duplicate Column `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/duplicate-column` **联调中**
   - ⚪️ Reorder Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-reorder` **未开始**

### 显示: 过滤
   - 🟢️️ Get View Filter **完成**
   - 🟢️️ Create View Filter **完成**
   - 🟢️️ Get Filter **完成**
   - 🟢️️ Update Filter **完成**
   - 🟢️️ Delete Filter **完成**
   - 🟢️️ 查询接口从过滤元信息中获取过滤条件并进行数据过滤 **完成**

### 导入: Excel
   > 已有表导入数据
   - 🟢 Bulk Insert Table Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-bulk-create` **完成**
   > 导入数据到新表
   - 🟢 Create Table `https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-create` **完成**
   - 🟢 Create Primary Value `https://meta-apis-v1.nocodb.com/#tag/DB-Table-Column/operation/db-table-column-primary-column-set` **完成**

### 导出: Excel, CSV
   > 导出数据
   - 🟢️ Export Table View Rows `https://data-apis-v1.nocodb.com/#tag/DB-Table-Row/operation/db-table-row-csv-export` **完成**

### 显示: 排序
   - 🟢 List View Sorts `https://meta-apis-v1.nocodb.com/#tag/DB-Table-Sort` **完成**
   - 🟢 Update View Sort `https://meta-apis-v1.nocodb.com/#tag/DB-Table-Sort/operation/db-table-sort-create` **完成**
   - 🟢 Get Sort `https://meta-apis-v1.nocodb.com/#tag/DB-Table-Sort/operation/db-table-sort-get` **完成**
   - 🟢 Update Sort `https://meta-apis-v1.nocodb.com/#tag/DB-Table-Sort/operation/db-table-sort-update` **完成**
   - 🟢 Delete Sort `https://meta-apis-v1.nocodb.com/#tag/DB-Table-Sort/operation/db-table-sort-delete` **完成**
   - 🟢️ 查询接口对结果进行排序 **完成**

### 后台任务
   > 复制表、字段时后台起的线程，前端会轮询其状态
   - 🟢️ /jobs/listen **完成**

## 6.7
   > 正式环境: http://smartdata.yindangu.com
   > 测试环境: http://smartdata-server.yindangu.com

### 前端
   > 复制表仍有小问题需要后续跟进: 复制后排序问题
   - 【进行中】提问建表: 优化选择模型范围操作体验
   - 【联调中】复制字段
   - 【完成】创建表时增加描述字段 
   - 【完成】创建字段时增加描述字段 
   - 【完成】问题修复 
      - 修复发布模型至目录后打开表格一直loading
      - 现有模型列表宽度调整，超出范围的模型名称增加提示框
      - 修复选择模型弹窗目录偶尔不展开问题
      - 搜索模型时展开最外一层目录
      - 提示框样式修改
      - 模型树表格拖拽指示器样式调节
      - 删除多余图片

### 需求池
   - 存储 Prompt 模板
   - MCMD: 发布模型时, 允许编辑表名及字段名 **完成**
   - MCDM: 发布模型时, 更新频率接口对接
   - MCDM: 表间数据复制
   - LLM: TalkData 智能分析
   - LLM: 修改模型元信息时重新训练 **完成**
   - LLM: 存储训练数据 (修改模型时重训) **完成**
   - LLM: 报告模板管理
   - LLM: 报告生成
   - Workflow: Docker 部署
   - 模型树: 拖拽排序
   - 模型树: 创建目录 **完成**
   - 提问建表: 持久化会话数据
   - 提问建表: 优化选择模型范围操作体验 **进行中**

### 平台
   - 【进行中】V: 小数精度显示问题
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
