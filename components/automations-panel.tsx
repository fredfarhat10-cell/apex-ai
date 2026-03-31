"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Card,
} from "@chakra-ui/react"
import { Plus, Trash2 } from "lucide-react"
import { getScheduler, type Job } from "@/lib/apex-scheduler"

interface AutomationsPanelProps {
  runAction: (action: string) => void
}

export default function AutomationsPanel({ runAction }: AutomationsPanelProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobName, setJobName] = useState("")
  const [jobInterval, setJobInterval] = useState(60)
  const [jobAction, setJobAction] = useState("run_financial_analysis")
  const toast = useToast()

  const scheduler = getScheduler(runAction)

  useEffect(() => {
    setJobs(scheduler.getJobs())
  }, [scheduler])

  const handleAddJob = () => {
    if (!jobName) {
      toast({ title: "Please provide a name for the automation.", status: "warning" })
      return
    }
    const newJob = scheduler.addJob({ name: jobName, interval: jobInterval, action: jobAction as any })
    setJobs([...jobs, newJob])
    setJobName("")
    toast({ title: `Automation "${jobName}" created.`, status: "success" })
  }

  const handleDeleteJob = (jobId: string) => {
    scheduler.removeJob(jobId)
    setJobs(jobs.filter((j) => j.id !== jobId))
    toast({ title: "Automation removed.", status: "info" })
  }

  return (
    <Box p={8} minH="100vh" bg="apex.darker" color="white">
      <Heading as="h1" size="xl" fontFamily="orbitron" mb={2}>
        Automations
      </Heading>
      <Text color="gray.400" mb={8}>
        Teach Apex to work for you in the background. Set up recurring tasks and proactive checks.
      </Text>

      <Card bg="whiteAlpha.50" p={6} rounded="xl" borderWidth="1px" borderColor="whiteAlpha.200" mb={8}>
        <Heading as="h3" size="md" mb={4}>
          Create New Automation
        </Heading>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Automation Name</FormLabel>
            <Input
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g., Morning Financial Briefing"
              bg="whiteAlpha.100"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Action</FormLabel>
            <Select value={jobAction} onChange={(e) => setJobAction(e.target.value)} bg="whiteAlpha.100">
              <option value="run_financial_analysis">Run Financial Analysis</option>
              <option value="check_goals">Check Goal Progress</option>
              <option value="generate_insights">Generate New Insights</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Run Every (minutes)</FormLabel>
            <Input
              type="number"
              value={jobInterval}
              onChange={(e) => setJobInterval(Number.parseInt(e.target.value))}
              bg="whiteAlpha.100"
            />
          </FormControl>
          <Button onClick={handleAddJob} colorScheme="purple" leftIcon={<Plus />} w="full">
            Add Automation
          </Button>
        </VStack>
      </Card>

      <Box>
        <Heading as="h3" size="md" mb={4}>
          Active Automations
        </Heading>
        <VStack spacing={3} align="stretch">
          {jobs.length === 0 ? (
            <Text color="gray.500">No automations running. Create one above to get started.</Text>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} bg="whiteAlpha.50" p={4} rounded="lg" borderWidth="1px" borderColor="whiteAlpha.100">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{job.name}</Text>
                    <Text fontSize="sm" color="gray.400">
                      Runs every {job.interval} minutes. Last run:{" "}
                      {job.lastRun ? new Date(job.lastRun).toLocaleTimeString() : "Never"}
                    </Text>
                  </Box>
                  <Button size="sm" variant="ghost" colorScheme="red" onClick={() => handleDeleteJob(job.id)}>
                    <Trash2 size={16} />
                  </Button>
                </HStack>
              </Card>
            ))
          )}
        </VStack>
      </Box>
    </Box>
  )
}
