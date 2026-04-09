import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepperProps {
  steps: string[]
  currentStep: number | string
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const current = typeof currentStep === 'string' ? parseInt(currentStep) : currentStep

  return (
    <div className='w-full'>
      {/* Desktop layout */}
      <div className='hidden md:flex items-center justify-between'>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < current
          const isActive = stepNumber === current
          const isPending = stepNumber > current

          return (
            <div key={index} className='flex items-center flex-1'>
              {/* Step circle */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm',
                  isCompleted && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
                  isActive && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-300 dark:ring-blue-600',
                  isPending && 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {isCompleted ? <Check className='h-5 w-5' /> : stepNumber}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 mx-2',
                    isCompleted ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile layout */}
      <div className='md:hidden flex flex-col gap-2'>
        <div className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
          Schritt {current} von {steps.length}
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
          <div
            className='bg-blue-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${(current / steps.length) * 100}%` }}
          />
        </div>
        <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
          {steps[current - 1]}
        </div>
      </div>
    </div>
  )
}
