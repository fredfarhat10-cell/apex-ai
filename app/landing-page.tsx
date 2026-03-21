"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Zap, Shield, Target, Activity, Check } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"

// Mock data for crypto chart
const cryptoData = [
  { time: "Jan", btc: 42000, eth: 2800 },
  { time: "Feb", btc: 45000, eth: 3100 },
  { time: "Mar", btc: 48000, eth: 3300 },
  { time: "Apr", btc: 52000, eth: 3600 },
  { time: "May", btc: 49000, eth: 3400 },
  { time: "Jun", btc: 55000, eth: 3800 },
  { time: "Jul", btc: 58000, eth: 4000 },
]

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <motion.div style={{ opacity }} className="absolute inset-0 bg-gradient-to-b from-[#FF6B00]/5 to-transparent" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              Stop Managing.
              <br />
              <span className="text-[#FF6B00]">Start Orchestrating.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Apex is the world's first AI Symbiont that unifies your goals, finances, and wellness into a single,
              intelligent system—unlocking performance you didn't know was possible.
            </p>

            {/* Apex Command Block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-3xl mx-auto mt-12"
            >
              <div className="bg-[#1A1A1F] border border-gray-800 rounded-xl p-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-gray-500">APEX COMMAND</span>
                </div>

                <div className="bg-[#0A0A0F] border border-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 italic">
                    "My marathon is in 12 weeks. My budget is $500/mo for training. My sleep quality is down 15%. Build
                    me an optimal training, nutrition, and recovery plan."
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Apply changes</span>
                    <div className="w-10 h-5 bg-[#FF6B00] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Context options</span>
                    <span className="text-gray-500">Include current file</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Model</span>
                    <span className="text-gray-300">Auto</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <Button
                size="lg"
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-8 py-6 text-lg font-semibold rounded-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 hover:bg-gray-900 px-8 py-6 text-lg rounded-lg bg-transparent"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0A0A0F] to-[#0F0F14]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  BEFORE
                </Badge>
                <h2 className="text-4xl font-bold">Fragmented & Reactive</h2>
                <ul className="space-y-4 text-gray-400">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                    <span>Juggling 10+ apps with no unified view</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                    <span>Missed opportunities buried in noise</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                    <span>Constant context switching draining energy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                    <span>Hitting performance plateaus</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                <Badge variant="outline" className="border-[#FF6B00]/50 text-[#FF6B00]">
                  AFTER
                </Badge>
                <h2 className="text-4xl font-bold">Unified & Proactive</h2>
                <ul className="space-y-4 text-gray-400">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6B00] mt-0.5" />
                    <span>One intelligent system, infinite possibilities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6B00] mt-0.5" />
                    <span>AI-surfaced opportunities at the perfect moment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6B00] mt-0.5" />
                    <span>Deep, focused work without interruption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6B00] mt-0.5" />
                    <span>Unlocking new levels of achievement</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Automate, accelerate, and simplify your life</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Apex gives you deep insights, generates plans instantly, and executes across multiple domains
              simultaneously.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12 text-[#FF6B00]" />,
                title: "True Symbiosis",
                description:
                  "Apex learns your unique patterns, energy levels, and goals to provide insights that are deeply personal and genuinely useful.",
              },
              {
                icon: <Zap className="w-12 h-12 text-[#FF6B00]" />,
                title: "Proactive Execution",
                description:
                  "Apex doesn't just suggest; it does. From booking travel to rescheduling your day based on your energy, it handles the logistics so you can focus.",
              },
              {
                icon: <Shield className="w-12 h-12 text-[#FF6B00]" />,
                title: "Zero-Knowledge Brain",
                description:
                  "Your data is your fortress. Apex runs 100% on your device with military-grade encryption. We can't see your data. Period.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1A1F] border-gray-800 h-full hover:border-[#FF6B00]/50 transition-colors">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Unlock Your Impossible Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0F0F14] to-[#0A0A0F]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Unlock Your Impossible</h2>
            <p className="text-xl text-gray-400">Built for those who refuse to settle</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-[#1A1A1F] to-[#0F0F14] border-gray-800 h-full hover:border-[#FF6B00]/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-8 h-8 text-[#FF6B00]" />
                    <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/50">THE ATHLETE</Badge>
                  </div>
                  <CardTitle className="text-3xl">Run a Sub-4-Hour Marathon</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-lg leading-relaxed">
                    Apex integrates your biometric data, nutrition, and calendar to build an adaptive training plan that
                    optimizes every minute of your preparation, from sleep schedules to interval training.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-[#1A1A1F] to-[#0F0F14] border-gray-800 h-full hover:border-[#FF6B00]/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-8 h-8 text-[#FF6B00]" />
                    <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/50">THE ENTREPRENEUR</Badge>
                  </div>
                  <CardTitle className="text-3xl">Build a 7-Figure Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-lg leading-relaxed">
                    Apex connects your project management, financial data, and network to identify high-leverage
                    opportunities, automate workflows, and provide the strategic insights needed to scale.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Crypto Guild Feature Spotlight */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/50 mb-4">NEW FEATURE</Badge>
            <h2 className="text-5xl font-bold mb-4">Introducing the Investment Guild</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your 24/7 AI Trading Team. Deploy autonomous AI agents to analyze market data, execute strategies, and
              manage your crypto portfolio while you sleep.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#1A1A1F] border border-gray-800 rounded-xl p-8"
          >
            <div className="grid md:grid-cols-[300px_1fr_300px] gap-6">
              {/* Markets Card */}
              <Card className="bg-[#0F0F14] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-400">Markets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-xs font-bold">
                        B
                      </div>
                      <div>
                        <div className="text-sm font-semibold">BTC</div>
                        <div className="text-xs text-gray-500">-3.6%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">$29,850.15</div>
                      <div className="text-xs text-gray-500">0.79 BTC</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">
                        E
                      </div>
                      <div>
                        <div className="text-sm font-semibold">ETH</div>
                        <div className="text-xs text-gray-500">-0.63%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">$10,561.24</div>
                      <div className="text-xs text-gray-500">+$40 ETH</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Currency</div>
                    <div className="text-3xl font-bold text-[#FF6B00]">$189,460.50</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-gray-700 bg-transparent">
                      1D
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-700 bg-transparent">
                      1W
                    </Button>
                    <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90">
                      1M
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-700 bg-transparent">
                      1Y
                    </Button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cryptoData}>
                    <defs>
                      <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2F" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Area type="monotone" dataKey="btc" stroke="#FF6B00" fillOpacity={1} fill="url(#colorBtc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Top Gainer Card */}
              <Card className="bg-[#0F0F14] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-400">Top gainer (24h)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                        ₿
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Bitcoin</div>
                        <div className="text-xs text-gray-500">BTC</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-500">+12.7%</div>
                      <div className="text-xs text-gray-500">USD 104,144.57</div>
                    </div>
                  </div>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cryptoData.slice(-5)}>
                        <Line type="monotone" dataKey="btc" stroke="#FF6B00" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0A0A0F] to-[#0F0F14]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Performance Plans</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Advanced Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-[#1A1A1F] border-gray-800 h-full">
                <CardHeader>
                  <CardTitle className="text-3xl mb-2">Advanced</CardTitle>
                  <CardDescription className="text-gray-400">
                    Premium models, enterprise controls, and throughput for automation-heavy workflows.
                  </CardDescription>
                  <div className="pt-6">
                    <div className="text-5xl font-bold">
                      $119 <span className="text-xl text-gray-400 font-normal">/user/month</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {[
                      "1900 Premium LLM Calls/day",
                      "Auto & Auto+ AI Models",
                      "Access to Claude Opus 4.1",
                      "Unlimited BYOK Calls",
                      "Multi-Repository Indexing",
                      "Analytics Dashboard",
                      "SSO & Audit Logs",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-white text-black hover:bg-gray-200 mt-6">GET ADVANCED</Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Max Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-[#1A1A1F] to-[#252530] border-[#FF6B00]/50 h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] to-orange-600" />
                <Badge className="absolute top-4 right-4 bg-[#FF6B00] text-white border-none">Full Power</Badge>
                <CardHeader>
                  <CardTitle className="text-3xl mb-2">Max</CardTitle>
                  <CardDescription className="text-gray-400">
                    Built for high-performing developers and teams with maximum usage limits.
                  </CardDescription>
                  <div className="pt-6">
                    <div className="text-5xl font-bold">
                      $250 <span className="text-xl text-gray-400 font-normal">/user/month</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {[
                      "4200 Premium LLM Calls/day",
                      "Auto & Auto+ AI Models",
                      "Access to Claude Opus 4.1",
                      "Unlimited BYOK Calls",
                      "Multi-Repository Indexing",
                      "Analytics Dashboard",
                      "SSO & Audit Logs",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-white text-black hover:bg-gray-200 mt-6">GET MAX</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-6">Everything you need. For less than a coffee a day.</h2>
              <p className="text-gray-400 leading-relaxed">
                Apex is designed for high-performers who understand that the right tools don't cost—they pay. Every
                feature is built to multiply your output and reclaim your time.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border border-gray-800 rounded-lg px-6 bg-[#1A1A1F]">
                  <AccordionTrigger className="text-left hover:no-underline">
                    How secure is my financial and strategic data?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    Apex uses military-grade AES-256 encryption and runs 100% on your device. We employ a zero-knowledge
                    architecture, meaning we cannot access your data even if we wanted to. Your vault is yours alone.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-gray-800 rounded-lg px-6 bg-[#1A1A1F]">
                  <AccordionTrigger className="text-left hover:no-underline">
                    Can I use my own API keys for certain agents?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    Absolutely. Apex supports BYOK (Bring Your Own Key) for all major AI providers, giving you full
                    control over your AI infrastructure and costs.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-gray-800 rounded-lg px-6 bg-[#1A1A1F]">
                  <AccordionTrigger className="text-left hover:no-underline">
                    What's the ROI for an entrepreneur?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    Our users report saving 10-15 hours per week on administrative tasks, strategic planning, and
                    decision-making. If your time is worth $100/hour, that's $1,500/week in reclaimed value—over $75,000
                    annually.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-gray-800 rounded-lg px-6 bg-[#1A1A1F]">
                  <AccordionTrigger className="text-left hover:no-underline">
                    How does Apex differ from ChatGPT or other general-purpose AIs?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    ChatGPT is a conversational tool. Apex is a proactive system that learns your context, executes
                    tasks autonomously, and orchestrates your entire life. It's the difference between asking for
                    directions and having a personal driver.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0F0F14] to-[#0A0A0F]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl md:text-6xl font-bold">
              Ready to <span className="text-[#FF6B00]">Orchestrate</span> Your Life?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of high-performers who have transformed their productivity with Apex AI.
            </p>
            <Button
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-12 py-8 text-xl font-semibold rounded-lg"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>&copy; 2025 Apex AI. Your data. Your device. Your fortress.</p>
        </div>
      </footer>
    </div>
  )
}
