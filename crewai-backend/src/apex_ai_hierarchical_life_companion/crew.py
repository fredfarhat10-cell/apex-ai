from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool, ScrapeWebsiteTool
from langchain_openai import ChatOpenAI
from .tools.memory_tool import MemoryTool
from .tools.crypto_market_tool import CryptoMarketTool

@CrewBase
class ApexAiHierarchicalLifeCompanion:
    """Apex AI Hierarchical Life Companion crew for financial intelligence"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
        self.search_tool = SerperDevTool()
        self.scrape_tool = ScrapeWebsiteTool()
        self.memory_tool = MemoryTool()
        self.crypto_tool = CryptoMarketTool()

    @agent
    def jarvis_financial_intelligence_specialist(self) -> Agent:
        """
        Financial Intelligence Specialist Agent
        Expert in market analysis, fundamental research, and investment recommendations
        """
        return Agent(
            config=self.agents_config['jarvis_financial_intelligence_specialist'],
            tools=[self.search_tool, self.scrape_tool, self.memory_tool, self.crypto_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def market_data_analyst(self) -> Agent:
        """
        Market Data Analyst Agent
        Specializes in technical analysis and market trends
        """
        return Agent(
            config=self.agents_config['market_data_analyst'],
            tools=[self.search_tool, self.scrape_tool, self.crypto_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def news_sentiment_analyst(self) -> Agent:
        """
        News & Sentiment Analyst Agent
        Analyzes news, social media, and market sentiment
        """
        return Agent(
            config=self.agents_config['news_sentiment_analyst'],
            tools=[self.search_tool, self.scrape_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def health_wellness_coach(self) -> Agent:
        """
        Health & Wellness Coach Agent
        Analyzes biometric data and provides wellness insights
        """
        return Agent(
            config=self.agents_config['health_wellness_coach'],
            tools=[self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def jarvis_career_strategist(self) -> Agent:
        """
        Career Strategist Agent
        Manages professional life, productivity, and career development
        """
        return Agent(
            config=self.agents_config['jarvis_career_strategist'],
            tools=[self.search_tool, self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def apex_unified_brain_orchestrator(self) -> Agent:
        """
        Apex Unified Brain Orchestrator Agent
        Master orchestrator for NLU, task processing, and life OS coordination
        """
        return Agent(
            config=self.agents_config['apex_unified_brain_orchestrator'],
            tools=[self.memory_tool, self.search_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=True
        )

    @agent
    def emotional_intelligence_engine(self) -> Agent:
        """
        Emotional Intelligence Engine Agent
        Infers user's emotional state and adapts communication tone
        """
        return Agent(
            config=self.agents_config['emotional_intelligence_engine'],
            tools=[self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def apex_predictive_intelligence_core(self) -> Agent:
        """
        Predictive Intelligence Core Agent
        Runs simulations and performs causal analysis
        """
        return Agent(
            config=self.agents_config['apex_predictive_intelligence_core'],
            tools=[self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def immersive_experience_architect(self) -> Agent:
        """
        Immersive Experience Architect Agent
        Creates narrative-driven, motivational content
        """
        return Agent(
            config=self.agents_config['immersive_experience_architect'],
            tools=[self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def apex_metacognition_engine(self) -> Agent:
        """
        Metacognition Engine Agent
        Analyzes AI performance and adapts strategies for continuous improvement
        """
        return Agent(
            config=self.agents_config['apex_metacognition_engine'],
            tools=[self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def crypto_trading_strategist(self) -> Agent:
        """
        Crypto Trading Strategist Agent
        Quantitative analyst for cryptocurrency markets with access to real-time market data
        """
        return Agent(
            config=self.agents_config['crypto_trading_strategist'],
            tools=[self.crypto_tool, self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def financial_onboarding_concierge(self) -> Agent:
        """
        Financial Onboarding Concierge Agent
        Guides users through initial financial setup with empathy and trust-building
        """
        return Agent(
            config=self.agents_config['financial_onboarding_concierge'],
            tools=[self.memory_tool],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @task
    def gather_market_data_task(self) -> Task:
        """Task to gather comprehensive market data for a ticker"""
        return Task(
            config=self.tasks_config['gather_market_data'],
            agent=self.market_data_analyst()
        )

    @task
    def analyze_news_sentiment_task(self) -> Task:
        """Task to analyze news and sentiment for a ticker"""
        return Task(
            config=self.tasks_config['analyze_news_sentiment'],
            agent=self.news_sentiment_analyst()
        )

    @task
    def generate_alpha_brief_task(self) -> Task:
        """Task to generate comprehensive Alpha Brief"""
        return Task(
            config=self.tasks_config['generate_alpha_brief'],
            agent=self.jarvis_financial_intelligence_specialist(),
            context=[self.gather_market_data_task(), self.analyze_news_sentiment_task()]
        )

    @task
    def process_unstructured_note_task(self) -> Task:
        """Task to process unstructured notes using NLU"""
        return Task(
            config=self.tasks_config['process_unstructured_note'],
            agent=self.apex_unified_brain_orchestrator()
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Apex AI Financial Intelligence crew"""
        return Crew(
            agents=[
                self.jarvis_financial_intelligence_specialist(),
                self.market_data_analyst(),
                self.news_sentiment_analyst(),
                self.health_wellness_coach(),
                self.jarvis_career_strategist(),
                self.apex_unified_brain_orchestrator(),
                self.emotional_intelligence_engine(),
                self.apex_predictive_intelligence_core(),
                self.immersive_experience_architect(),
                self.apex_metacognition_engine(),
                self.crypto_trading_strategist(),
                self.financial_onboarding_concierge()
            ],
            tasks=[self.gather_market_data_task(), self.analyze_news_sentiment_task(), self.generate_alpha_brief_task(), self.process_unstructured_note_task()],
            process=Process.sequential,
            verbose=True
        )
