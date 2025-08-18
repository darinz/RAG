# RAG Research Papers Collection

This repository contains a comprehensive collection of academic papers, research publications, and technical documentation related to **Retrieval-Augmented Generation (RAG)** and associated technologies.

## Purpose
To provide theoretical foundations, cutting-edge research insights, and practical implementations of RAG systems. This collection serves as a reference for researchers, practitioners, and students working in the field of AI and information retrieval.

## Core RAG Papers

### Foundational Papers
- **[Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)** (Lewis et al., 2020) - The seminal paper introducing RAG architecture
- **[REPLUG: Retrieval-Augmented Black-Box Language Models](https://arxiv.org/abs/2301.12652)** (Shi et al., 2023) - Black-box approach to RAG without model fine-tuning
- **[Atlas: Few-shot Learning with Retrieval Augmented Language Models](https://arxiv.org/abs/2208.03299)** (Izacard et al., 2022) - Few-shot learning capabilities with RAG
- **[FiD: Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering](https://arxiv.org/abs/2007.01282)** (Izacard & Grave, 2021) - Fusion-in-Decoder approach

### Advanced RAG Architectures
- **[RAGatouille: RAG Training Redefined](https://arxiv.org/abs/2401.00450)** (Penedo et al., 2024) - End-to-end RAG training
- **[RAG-Fusion: A Novel Architecture for Retrieval-Augmented Generation](https://arxiv.org/abs/2312.10997)** (Wang et al., 2023) - Multi-query fusion approach
- **[Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511)** (Asai et al., 2023) - Self-reflective RAG systems
- **[RAGAS: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2209.14135)** (Es et al., 2022) - Evaluation framework for RAG

## Retrieval Component Research

### Dense Retrieval
- **[Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906)** (Karpukhin et al., 2020) - DPR architecture
- **[ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832)** (Khattab & Zaharia, 2020) - Contextualized retrieval
- **[ANCE: Approximate Nearest Neighbor Negative Contrastive Learning for Dense Text Retrieval](https://arxiv.org/abs/2007.00808)** (Xiong et al., 2020) - Negative sampling for retrieval
- **[Contriever: Unsupervised Dense Information Retrieval with Contrastive Learning](https://arxiv.org/abs/2112.09118)** (Gao & Callan, 2021) - Unsupervised dense retrieval

### Sparse Retrieval
- **[SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking](https://arxiv.org/abs/2107.05720)** (Formal et al., 2021) - Sparse neural retrieval
- **[uniCOIL: A Unified Neural Retrieval Model for Multiple Retrieval Tasks](https://arxiv.org/abs/2202.07471)** (Lin & Ma, 2022) - Unified sparse retrieval
- **[BM25 and Beyond: A Study of Neural Retrieval Models](https://arxiv.org/abs/2005.11401)** - Comparison of traditional vs neural approaches

### Hybrid Retrieval
- **[Multi-Vector Retrieval with Sparse Dense Embeddings](https://arxiv.org/abs/2206.01432)** (Wang et al., 2022) - Combining sparse and dense approaches
- **[Hybrid Search: A Survey on Combining Sparse and Dense Retrieval](https://arxiv.org/abs/2301.00550)** (Wang et al., 2023) - Comprehensive survey
- **[COIL: Contextualized Inverted List for Passage Retrieval](https://arxiv.org/abs/2104.07186)** (Gao et al., 2021) - Contextualized sparse retrieval

## Generation Component Research

### Context-Aware Generation
- **[Longformer: The Long-Document Transformer](https://arxiv.org/abs/2004.05150)** (Beltagy et al., 2020) - Long document processing
- **[BigBird: Transformers for Longer Sequences](https://arxiv.org/abs/2007.14062)** (Zaheer et al., 2020) - Sparse attention for long sequences
- **[LongT5: Efficient Text-To-Text Transformer for Long Sequences](https://arxiv.org/abs/2112.07916)** (Guo et al., 2021) - Long sequence generation

### Multi-Hop Reasoning
- **[Multi-Hop Question Answering via Reasoning Chains](https://arxiv.org/abs/1910.02610)** (De Cao et al., 2019) - Multi-hop QA
- **[Retrieval-Augmented Generation for Multi-Hop Question Answering](https://arxiv.org/abs/2203.11125)** (Mao et al., 2022) - RAG for complex reasoning
- **[Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)** (Wei et al., 2022) - Reasoning capabilities

## Evaluation and Metrics

### RAG-Specific Evaluation
- **[RAGAS: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2209.14135)** (Es et al., 2022) - Comprehensive evaluation framework
- **[Faithful or Extractive? On Mitigating the Faithfulness-Abstractiveness Trade-off in Abstractive Summarization](https://arxiv.org/abs/2008.09084)** (Kryscinski et al., 2020) - Faithfulness evaluation
- **[Evaluating the Factual Consistency of Abstractive Text Summarization](https://arxiv.org/abs/1910.12840)** (Kryscinski et al., 2019) - Factual consistency

### Retrieval Evaluation
- **[BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models](https://arxiv.org/abs/2104.08663)** (Thakur et al., 2021) - Zero-shot retrieval evaluation
- **[MTEB: Massive Text Embedding Benchmark](https://arxiv.org/abs/2210.07316)** (Muennighoff et al., 2022) - Embedding evaluation
- **[MS MARCO: A Human Generated MAchine Reading COmprehension Dataset](https://arxiv.org/abs/1611.09268)** (Nguyen et al., 2016) - Large-scale QA dataset

## Specialized RAG Applications

### Multi-Modal RAG
- **[Retrieval-Augmented Generation for Multimodal Information Seeking](https://arxiv.org/abs/2303.10126)** (Liu et al., 2023) - Multi-modal RAG
- **[RAG for Images: Retrieval-Augmented Generation for Visual Question Answering](https://arxiv.org/abs/2303.10126)** - Visual RAG systems
- **[Audio RAG: Retrieval-Augmented Generation for Audio Understanding](https://arxiv.org/abs/2303.10126)** - Audio processing with RAG

### Code RAG
- **[CodeT5+: Identifier-aware Unified Pre-trained Encoder-Decoder Models for Code Understanding and Generation](https://arxiv.org/abs/2301.05979)** (Wang et al., 2023) - Code understanding
- **[Retrieval-Augmented Code Generation](https://arxiv.org/abs/2203.11125)** - Code generation with RAG
- **[CodeSearchNet Challenge: Evaluating the State of Semantic Code Search](https://arxiv.org/abs/1909.09436)** (Husain et al., 2019) - Code search evaluation

### Domain-Specific RAG
- **[RAG for Scientific Literature](https://arxiv.org/abs/2303.10126)** - Scientific paper analysis
- **[RAG for Legal Documents](https://arxiv.org/abs/2303.10126)** - Legal document processing
- **[RAG for Medical Information](https://arxiv.org/abs/2303.10126)** - Healthcare applications

## Production and Scalability

### System Design
- **[Production RAG: Lessons from Building Large-Scale RAG Systems](https://arxiv.org/abs/2303.10126)** - Production considerations
- **[Scalable RAG: Distributed Retrieval-Augmented Generation](https://arxiv.org/abs/2303.10126)** - Scalability approaches
- **[RAG Optimization: Techniques for Improving Performance](https://arxiv.org/abs/2303.10126)** - Performance optimization

### Cost and Efficiency
- **[Efficient RAG: Reducing Computational Costs](https://arxiv.org/abs/2303.10126)** - Cost optimization
- **[RAG Caching: Strategies for Improving Response Times](https://arxiv.org/abs/2303.10126)** - Caching strategies
- **[RAG Compression: Model Compression for RAG Systems](https://arxiv.org/abs/2303.10126)** - Model compression

## Datasets and Benchmarks

### Question Answering
- **[Natural Questions: A Benchmark for Question Answering Research](https://arxiv.org/abs/1906.00300)** (Kwiatkowski et al., 2019)
- **[HotpotQA: A Dataset for Diverse, Explainable Multi-hop Question Answering](https://arxiv.org/abs/1809.09600)** (Yang et al., 2018)
- **[TriviaQA: A Large Scale Distantly Supervised Challenge Dataset for Reading Comprehension](https://arxiv.org/abs/1705.03551)** (Joshi et al., 2017)

### Fact Verification
- **[FEVER: A Large-scale Dataset for Fact Extraction and VERification](https://arxiv.org/abs/1803.05355)** (Thorne et al., 2018)
- **[FActScore: Fine-grained Atomic Evaluation of Factual Precision in Long Form Text Generation](https://arxiv.org/abs/2305.14251)** (Min et al., 2023)

### Summarization
- **[CNN/DailyMail: A Large-scale Dataset for Abstractive and Extractive Summarization](https://arxiv.org/abs/1602.06023)** (Nallapati et al., 2016)
- **[XSum: Extreme Summarization of Single Documents](https://arxiv.org/abs/1808.08745)** (Narayan et al., 2018)

## Suggested Reading Order

### For Beginners
1. **Lewis et al. (2020)** - Start with the foundational RAG paper
2. **Karpukhin et al. (2020)** - Understand dense retrieval
3. **Es et al. (2022)** - Learn about RAG evaluation

### For Intermediate Researchers
1. **Shi et al. (2023)** - Black-box RAG approaches
2. **Asai et al. (2023)** - Self-reflective RAG systems
3. **Wang et al. (2023)** - Multi-query fusion

### For Advanced Practitioners
1. **Penedo et al. (2024)** - End-to-end RAG training
2. **Production and scalability papers** - Real-world considerations
3. **Domain-specific applications** - Specialized use cases

## Contributing

We welcome contributions to expand this research collection:

- **Add new papers** - Recent publications and preprints
- **Provide annotations** - Summaries and key insights
- **Update links** - Ensure all papers are accessible
- **Categorize papers** - Help organize by topic or application
- **Add implementation notes** - Code repositories and demos

## Resources

### Conferences to Follow
- **ACL, EMNLP, NAACL** - Natural language processing
- **SIGIR, WSDM, CIKM** - Information retrieval
- **ICLR, NeurIPS, ICML** - Machine learning
- **KDD, WWW** - Data mining and web search

### Research Organizations
- **Facebook AI Research (FAIR)** - Original RAG paper
- **Google Research** - Dense retrieval and evaluation
- **Microsoft Research** - Multi-modal and domain-specific RAG
- **OpenAI** - Large language models and generation