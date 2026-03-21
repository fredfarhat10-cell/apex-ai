// Apex Scheduler - Client-side automation engine
// Runs entirely in the browser using setInterval for 100% privacy

export interface Job {
  id: string
  name: string
  interval: number // in minutes
  action: "run_financial_analysis" | "check_goals" | "generate_insights" | "run_precognition" // Added pre-cognition action type
  lastRun?: Date
}

class ApexScheduler {
  private jobs: Job[] = []
  private intervalId: NodeJS.Timeout | null = null
  private onJobRun: (action: string) => void

  constructor(onJobRun: (action: string) => void) {
    this.onJobRun = onJobRun
  }

  start() {
    if (this.intervalId) return
    // Check for jobs every minute
    this.intervalId = setInterval(() => this.runPendingJobs(), 60000)
    console.log("[v0] Apex Scheduler started.")
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("[v0] Apex Scheduler stopped.")
    }
  }

  addJob(job: Omit<Job, "id">): Job {
    const newJob: Job = { ...job, id: `job_${Date.now()}` }
    this.jobs.push(newJob)
    console.log("[v0] Added new job:", newJob)
    return newJob
  }

  removeJob(jobId: string) {
    this.jobs = this.jobs.filter((j) => j.id !== jobId)
    console.log("[v0] Removed job:", jobId)
  }

  getJobs(): Job[] {
    return this.jobs
  }

  private runPendingJobs() {
    const now = new Date()
    this.jobs.forEach((job) => {
      if (!job.lastRun || (now.getTime() - new Date(job.lastRun).getTime()) / 60000 >= job.interval) {
        console.log(`[v0] Running job: ${job.name}`)
        this.onJobRun(job.action)
        job.lastRun = now
      }
    })
  }
}

let instance: ApexScheduler | null = null
export const getScheduler = (onJobRun: (action: string) => void) => {
  if (!instance) {
    instance = new ApexScheduler(onJobRun)
  }
  return instance
}
