'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WorkloadReportProps {
  projectId?: string
  availableProjects?: Array<{ id: string; name: string }>
  availableOwners?: string[]
}

export function WorkloadReport({ 
  projectId,
  availableProjects = [],
  availableOwners = []
}: WorkloadReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workload Report</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Workload report functionality will be implemented here. This requires API routes at /api/reports/workload.
        </p>
      </CardContent>
    </Card>
  )
}
