"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, Calendar, BarChart3, User, Building, 
  ArrowRight, ArrowLeft, Edit, Eye, Trash2, Star, MessageSquare
} from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Deal, DealStage, DealStageConfig } from "@/types/crm"

interface KanbanBoardProps {
  deals: Deal[]
  stages: DealStageConfig[]
  onMoveDeal: (dealId: string, newStage: DealStage) => void
  onEditDeal: (deal: Deal) => void
  onSelectDeal: (deal: Deal) => void
  onDeleteDeal: (dealId: string) => void
}

interface DraggedDeal {
  dealId: string
  sourceStage: DealStage
  element: HTMLElement
}

export function KanbanBoard({ 
  deals, 
  stages, 
  onMoveDeal, 
  onEditDeal, 
  onSelectDeal, 
  onDeleteDeal 
}: KanbanBoardProps) {
  const [draggedDeal, setDraggedDeal] = useState<DraggedDeal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', deal.id)
    
    setDraggedDeal({
      dealId: deal.id,
      sourceStage: deal.stage,
      element: e.currentTarget as HTMLElement
    })

    // Add visual feedback
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1'
    setDraggedDeal(null)
    setDragOverStage(null)
  }

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the stage area entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault()
    
    if (draggedDeal && draggedDeal.sourceStage !== targetStage) {
      onMoveDeal(draggedDeal.dealId, targetStage)
    }
    
    setDraggedDeal(null)
    setDragOverStage(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const getDealsForStage = (stageId: DealStage) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const getStageValue = (stageId: DealStage) => {
    const stageDeals = getDealsForStage(stageId)
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getStageCount = (stageId: DealStage) => {
    return getDealsForStage(stageId).length
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4" ref={dragRef}>
      {stages.map((stage) => {
        const stageDeals = getDealsForStage(stage.id)
        const isDragOver = dragOverStage === stage.id
        const isWonStage = stage.isWon
        const isLostStage = stage.isLost

        return (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-80 ${
              isDragOver ? 'ring-2 ring-orange-500 ring-opacity-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <Card className={`h-full ${
              isWonStage ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
              isLostStage ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
              'border-gray-200 dark:border-gray-700'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <CardTitle className="text-sm font-medium">
                      {stage.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                    {stageDeals.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(getStageValue(stage.id))}
                      </span>
                    )}
                  </div>
                </div>
                {stage.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stage.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3 min-h-[400px]">
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={() => onEditDeal(deal)}
                    onSelect={() => onSelectDeal(deal)}
                    onDelete={() => onDeleteDeal(deal.id)}
                  />
                ))}
                
                {stageDeals.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <div className="text-sm">No deals in this stage</div>
                      <div className="text-xs">Drag deals here to move them</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

interface DealCardProps {
  deal: Deal
  onDragStart: (e: React.DragEvent, deal: Deal) => void
  onDragEnd: (e: React.DragEvent) => void
  onEdit: () => void
  onSelect: () => void
  onDelete: () => void
}

function DealCard({ 
  deal, 
  onDragStart, 
  onDragEnd, 
  onEdit, 
  onSelect, 
  onDelete 
}: DealCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isHovered ? 'shadow-md scale-105' : ''
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2 leading-tight">
              {deal.name}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Email Thread
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Company/Contact */}
          <div className="text-sm text-muted-foreground">
            {deal.company?.name || `${deal.contact?.firstName} ${deal.contact?.lastName}`}
          </div>

          {/* Value and Probability */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant="outline" className="text-xs">
              {deal.probability}%
            </Badge>
          </div>

          {/* Close Date */}
          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(new Date(deal.expectedCloseDate))}
            </div>
          )}

          {/* Priority */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getPriorityColor(deal.priority)}`}
            >
              {deal.priority}
            </Badge>
            
            {/* Tags */}
            <div className="flex gap-1">
              {deal.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {deal.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{deal.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>

          {/* Owner */}
          {deal.owner && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {deal.owner.firstName} {deal.owner.lastName}
            </div>
          )}

          {/* Last Activity */}
          {deal.lastActivityAt && (
            <div className="text-xs text-muted-foreground">
              Last activity: {formatDate(new Date(deal.lastActivityAt))}
            </div>
          )}

          {/* Notes Preview */}
          {deal.notes && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {deal.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default KanbanBoard
