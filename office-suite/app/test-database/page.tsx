'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { testConnection, getUsers } from '@/lib/api/admin-api-fallback'
import { diagnoseDatabase, checkTableExists, getTableStructure } from '@/lib/api/database-diagnostic'
import { testSimpleConnection, testEnvironmentVariables, testNetworkConnectivity } from '@/lib/test-connection-simple'

export default function TestDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [tableDetails, setTableDetails] = useState<any>({})

  const testDatabaseConnection = async () => {
    setConnectionStatus('testing')
    setConnectionError(null)
    
    try {
      console.log('🔍 Starting database connection test...')
      
      // Test 1: Environment variables
      console.log('Testing environment variables...')
      const envTest = await testEnvironmentVariables()
      console.log('Environment test:', envTest)
      
      if (!envTest.success) {
        setConnectionStatus('error')
        setConnectionError(envTest.error || 'Environment variables not set')
        return
      }
      
      // Test 2: Network connectivity
      console.log('Testing network connectivity...')
      const networkTest = await testNetworkConnectivity()
      console.log('Network test:', networkTest)
      
      if (!networkTest.success) {
        setConnectionStatus('error')
        setConnectionError(networkTest.error || 'Network connectivity failed')
        return
      }
      
      // Test 3: Database connection
      console.log('Testing database connection...')
      const dbTest = await testSimpleConnection()
      console.log('Database test:', dbTest)
      
      if (dbTest.success) {
        setConnectionStatus('success')
        // Also test fetching users
        const usersData = await getUsers()
        setUsers(usersData)
      } else {
        setConnectionStatus('error')
        setConnectionError(dbTest.error || 'Database connection failed')
      }
      
    } catch (error: any) {
      console.error('Test failed:', error)
      setConnectionStatus('error')
      setConnectionError(error.message)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (error: any) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Database Connection Test</h1>
          <p className="text-muted-foreground">Test your Supabase database connection and data</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connection Status
              {connectionStatus === 'testing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
              {connectionStatus === 'success' && <span className="text-green-500">✅</span>}
              {connectionStatus === 'error' && <span className="text-red-500">❌</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionStatus === 'testing' && (
              <p className="text-muted-foreground">Testing database connection...</p>
            )}
            {connectionStatus === 'success' && (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✅ Database connection successful!</p>
                <p className="text-sm text-muted-foreground">
                  Your Supabase database is connected and working properly.
                </p>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">❌ Database connection failed</p>
                <p className="text-sm text-muted-foreground">
                  Error: {connectionError}
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Troubleshooting Steps:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Check your <code>.env.local</code> file has correct Supabase credentials</li>
                    <li>Run the database schema in your Supabase dashboard</li>
                    <li>Verify your Supabase project is active</li>
                    <li>Check the browser console for detailed errors</li>
                  </ol>
                </div>
              </div>
            )}
            <Button 
              onClick={testDatabaseConnection} 
              className="mt-4"
              disabled={connectionStatus === 'testing'}
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
            </Button>
          </CardContent>
        </Card>

        {/* Users Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Users Data
              <Button onClick={loadUsers} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh Users'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found. This might be expected if the database is empty.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found {users.length} user(s) in the database
                </p>
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Quota: {user.usedQuota}/{user.quota} MB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Diagnostic */}
        {diagnostic && (
          <Card>
            <CardHeader>
              <CardTitle>Database Diagnostic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tables Found ({diagnostic.tables.length}):</h4>
                  {diagnostic.tables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {diagnostic.tables.map((table: string) => (
                        <Badge key={table} variant="default">{table}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No tables found</p>
                  )}
                </div>
                
                {diagnostic.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Errors ({diagnostic.errors.length}):</h4>
                    <div className="space-y-1">
                      {diagnostic.errors.map((error: string, index: number) => (
                        <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                {diagnostic.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      {diagnostic.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table Details */}
        {Object.keys(tableDetails).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Table Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(tableDetails).map(([tableName, details]: [string, any]) => (
                  <div key={tableName} className="border rounded p-3">
                    <h4 className="font-medium mb-2">{tableName}</h4>
                    {details.error ? (
                      <p className="text-sm text-red-600">{details.error}</p>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Columns: {details.columns?.length || 0}
                        </p>
                        {details.columns && (
                          <div className="flex flex-wrap gap-1">
                            {details.columns.map((column: string) => (
                              <Badge key={column} variant="outline" className="text-xs">
                                {column}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">If the connection is successful:</h4>
                <p className="text-sm text-muted-foreground">
                  Your database is set up correctly! You can now use the full platform with real data.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">If you see errors:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Run the database schema from <code>admin-schema-fixed.sql</code></li>
                  <li>Refresh this page and test again</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
