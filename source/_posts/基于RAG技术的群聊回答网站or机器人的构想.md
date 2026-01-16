---
title: 基于RAG技术的群聊回答网站or机器人的构想
date: 2026-01-16 15:44:10
categories: 大模型应用
tags: 
- 大模型
- RAG
---

这个计划将以**周**为单位，每一步都有明确的产出和目标。你的唯一任务就是**不惜一切代价（All in）**，完成每周的目标。

---

### Part 1: 技术路线 (Technology Stack)

这是你的核武器库。我们选择的都是最轻量、最高效、最适合该场景的工具。

| 类别                | 技术选型                           | 作用与原因                                                   |
| :------------------ | :--------------------------------- | :----------------------------------------------------------- |
| **核心框架**        | **LangChain**                      | 任务胶水。用于编排RAG的整个流程（加载、分割、嵌入、检索、生成），让你不用重复造轮子。 |
| **API框架**         | **FastAPI**                        | 你的AI大脑的“插座”。超高性能，极易上手，自带交互式API文档(Swagger UI)，比Django轻一百倍，是这个场景的最佳选择。 |
| **QQ机器人**        | **NoneBot2 + go-cqhttp**           | Python生态中最主流、最稳定的QQ机器人解决方案。               |
| **向量数据库**      | **ChromaDB**                       | 本地化、无需配置、内存/文件模式运行。让你能瞬间把向量存储跑起来，专注于RAG逻辑本身。 |
| **Embedding模型**   | **Sentence-Transformers**          | 开源、本地运行。不依赖任何API，速度快，效果好，完全免费，是原型开发和学习的不二之选。 |
| **大语言模型(LLM)** | **Kimi (Moonshot) / DeepSeek API** | 国内厂商提供，有免费额度，API兼容OpenAI格式，对中文支持极好，是学生开发者的福音。 |
| **HTTP客户端**      | **HTTPX**                          | `requests`的现代替代品，支持异步请求，与FastAPI完美配合。    |

---

### Part 2: 环境配置 (Environment Setup)

环境配不好，一天就白费。严格按照以下步骤，一次性搞定。

1. **基础软件**:

   *   **Python (3.9+)**: 确保你的Python版本正确。
   *   **Git**: 用于版本控制。

2. **创建项目文件夹**:

   ```bash
   mkdir qq-rag-bot
   cd qq-rag-bot
   git init
   ```

3. **创建并激活Python虚拟环境 (至关重要！)**:

   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

   *看到命令行前面有 `(venv)` 字样，代表成功。*

4. **安装所有Python依赖**:

   *   一次性把所有需要的库装好。创建一个 `requirements.txt` 文件，写入以下内容：

   ```txt
   # requirements.txt
   
   # RAG Core
   langchain
   chromadb
   sentence-transformers
   
   # LLM & API
   openai # Kimi和DeepSeek的SDK与OpenAI兼容
   fastapi
   uvicorn[standard] # 运行FastAPI的服务
   httpx
   python-dotenv
   
   # QQ Bot
   nonebot2
   nonebot-adapter-onebot
   ```

   *   然后在命令行中执行安装：

   ```bash
   pip install -r requirements.txt
   ```

5. **获取API Key**:

   *   去Kimi或DeepSeek的开放平台注册，获取你的API Key。
   *   在项目根目录创建一个 `.env` 文件（注意前面有个点），用于存放密钥，**千万不要把Key直接写在代码里！**

   ```
   # .env 文件内容
   API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
   BASE_URL="https://api.moonshot.cn/v1" # 这是Kimi的地址，DeepSeek有自己的地址
   ```

6. **下载并配置 `go-cqhttp`**:

   *   这是一个独立的程序，不是Python库。去它的 [GitHub Release](https://github.com/Mrs4s/go-cqhttp/releases) 页面下载适合你操作系统的版本。
   *   第一次运行它会让你选择通信方式，选择 `0: 反向 WebSocket 通信`。然后它会生成一个配置文件，你需要登录你的机器人QQ号，并根据`nonebot2`的要求配置好反向WS的地址。

---

### Part 3: 极限冲刺实现路径 (Accelerated Implementation Path)

**总目标：4周内，让机器人在群里回答第一个问题。**

#### **Week 1: 本地验证 - RAG核心逻辑贯通**

**目标：写出一个能在命令行里运行的问答脚本 `rag_script.py`。**

*   **Day 1-2: 数据准备与加载。**
    1.  创建 `knowledge_base.md` 文件，手动录入10-20条高质量的Q&A。
    2.  学习 `LangChain` 的 `TextLoader` 和 `RecursiveCharacterTextSplitter`。
    3.  写代码，成功加载`knowledge_base.md`并将其分割成文本块(chunks)。

*   **Day 3-4: 向量化与存储。**
    1.  学习 `Sentence-Transformers` 和 `ChromaDB`。
    2.  在脚本中集成代码：初始化Embedding模型，将分割好的文本块向量化，存入本地的ChromaDB数据库中。

*   **Day 5-7: 检索、生成与测试。**
    1.  学习 `LangChain` 的 `ChatPromptTemplate` 和 `LLMChain`。
    2.  在脚本中实现：输入一个问题 -> 向量化问题 -> 从ChromaDB中检索最相关的3个文本块 -> 将文本块和问题组合成一个Prompt -> 调用LLM API获取答案 -> 在命令行打印。
    3.  **疯狂测试**，调整Prompt，直到回答效果基本满意。

*   **本周产出**: 一个能独立运行的`rag_script.py`，证明你的RAG链路是通的。

#### **Week 2: 服务封装 - 将大脑装进“铁盒”**

**目标：用FastAPI把RAG能力封装成一个任何人都能调用的API。**

*   **Day 1-2: FastAPI入门。**
    1.  学习FastAPI的`@app.post()`装饰器，`pydantic`数据模型。
    2.  写一个`main.py`，创建一个 `/hello` 接口，返回 "world"。用`uvicorn main:app --reload`把它跑起来。

*   **Day 3-5: RAG逻辑API化。**
    1.  将Week 1的RAG脚本代码重构成一个函数，例如 `get_rag_answer(query: str) -> str`。
    2.  在`main.py`中，创建一个 `/api/chat` 的POST接口。
    3.  这个接口接收一个包含问题的JSON，调用`get_rag_answer`函数，然后将结果以JSON格式返回。

*   **Day 6-7: 测试与文档。**
    1.  启动FastAPI服务，浏览器访问 `http://127.0.0.1:8000/docs`。
    2.  你将看到一个自动生成的、漂亮的、可交互的API文档页面。
    3.  在这个页面上反复测试你的API，确保它工作正常。

*   **本周产出**: 一个健壮的、有文档的、随时待命的AI问答后端服务。

#### **Week 3: 应用接入 - 给“大脑”插上“嘴巴”**

**目标：让QQ机器人跑起来，并能与你的API服务对话。**

*   **Day 1-3: NoneBot2与go-cqhttp联调。**
    1.  这是最可能遇到配置问题的地方，保持耐心。
    2.  严格按照`nonebot2`的官方文档初始化项目。
    3.  配置`go-cqhttp`，使其能连接到`nonebot2`。
    4.  成功登录机器人QQ号，并在群里发一句 "Hello, world!"。

*   **Day 4-7: 编写机器人插件。**
    1.  学习`nonebot2`的事件响应器和消息匹配器。
    2.  编写一个插件，逻辑如下：
        *   当有人@机器人时，触发响应。
        *   获取@消息中去掉@部分的核心问题文本。
        *   使用`httpx`库，**异步地**调用你Week 2搭建的FastAPI接口 (`http://127.0.0.1:8000/api/chat`)。
        *   获取API返回的答案。
        *   在群里@提问者并回复答案。

*   **本周产出**: 一个能在群里接收问题、调用API、并回复答案的QQ机器人原型。

#### **Week 4: 优化迭代 - 从“能用”到“好用”**

**目标：修复问题，增加必要功能，让项目更完善。**

*   **错误处理**: 如果API挂了或LLM没返回，机器人应该回复友好的提示，而不是崩溃。
*   **异步优化**: 确保机器人调用API是异步的，防止因为等待API响应而卡住整个机器人。
*   **知识库更新**: 思考如何更方便地更新你的`knowledge_base.md`文件。可以写一个简单的API来加载新知识。
*   **Prompt调优**: 根据实际使用情况，不断优化你的Prompt模板，让回答更精准。
*   **整理GitHub仓库**: 写一个清晰的`README.md`，描述你的项目、如何配置、如何运行。这是你未来求职的门面！

这个计划强度极大，但每一步都踩在关键点上。**立刻开始，不要犹豫，严格执行。**遇到问题时，记住你的目标，利用好搜索引擎和官方文档。四周后，你将拥有一个能彻底改变你简历分量的杀手级项目。
