import * as React from 'react'
import { Example, ExampleWrapper } from '@/apps/main/components/example'
import { Avatar, AvatarFallback, AvatarImage } from '@/apps/main/components/ui/avatar'
import { Badge } from '@/apps/main/components/ui/badge'
import { Button } from '@/apps/main/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/apps/main/components/ui/card'
import { Checkbox } from '@/apps/main/components/ui/checkbox'
import { Input } from '@/apps/main/components/ui/input'
import { Label } from '@/apps/main/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/apps/main/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/apps/main/components/ui/select'
import { Separator } from '@/apps/main/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/apps/main/components/ui/sheet'
import { Switch } from '@/apps/main/components/ui/switch'
import { Textarea } from '@/apps/main/components/ui/textarea'
import {
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PackageIcon,
  SearchIcon,
  GlobeIcon,
  StarIcon,
  SendIcon,
  ArrowUpIcon,
  LoaderIcon,
  LinkIcon,
  RefreshCwIcon,
} from 'lucide-react'

export function ComponentExample() {
  return (
    <ExampleWrapper>
      <CardExample />
      <FormExample />
      <ComplexFormExample />
      <FieldsExample />
      <ItemExample />
      <ButtonGroupExample />
      <EmptyExample />
      <InputGroupExample />
      <SheetExample />
      <BadgeExample />
    </ExampleWrapper>
  )
}

function CardExample() {
  return (
    <Example title="Card" className="items-center justify-center">
      <Card className="relative w-full max-w-sm overflow-hidden pt-0">
        <div className="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color" />
        <img
          src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Photo by mymind on Unsplash"
          title="Photo by mymind on Unsplash"
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
        />
        <CardHeader>
          <CardTitle>Observability Plus is replacing Monitoring</CardTitle>
          <CardDescription>
            Switch to the improved way to explore your data, with natural
            language. Monitoring will no longer be available on the Pro plan in
            November, 2025
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Query
          </Button>
          <Badge variant="secondary" className="ml-auto">
            Warning
          </Badge>
        </CardFooter>
      </Card>
    </Example>
  )
}

function FormExample() {
  return (
    <Example title="Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  <SelectItem value="remix">Remix</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea id="comments" placeholder="Add any additional comments" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Submit</Button>
              <Button variant="outline" type="button">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Example>
  )
}

function ComplexFormExample() {
  return (
    <Example title="Complex Form">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>All transactions are secure and encrypted</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input id="card-name" placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Enter your 16-digit number.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i} value={String(2024 + i)}>
                        {2024 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Billing Address</h4>
              <p className="text-sm text-muted-foreground">The billing address associated with your payment.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="same-address" defaultChecked />
              <Label htmlFor="same-address" className="text-sm font-normal">Same as shipping address</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-comments">Comments</Label>
              <Textarea id="payment-comments" placeholder="Add any additional comments" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Submit</Button>
              <Button variant="outline" type="button">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Example>
  )
}

function FieldsExample() {
  const [computeEnv, setComputeEnv] = React.useState('kubernetes')
  const [gpuCount, setGpuCount] = React.useState(8)
  const [wallpaperTinting, setWallpaperTinting] = React.useState(true)
  const [termsAccepted, setTermsAccepted] = React.useState(true)
  const [priceRange, setPriceRange] = React.useState(50)

  return (
    <Example title="Fields">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Compute Environment</CardTitle>
          <CardDescription>Select the compute environment for your cluster.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={computeEnv} onValueChange={setComputeEnv} className="space-y-3">
            <div className={`flex items-start space-x-3 border rounded-md p-4 ${computeEnv === 'kubernetes' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="kubernetes" id="kubernetes" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="kubernetes" className="font-medium">Kubernetes</Label>
                <p className="text-sm text-muted-foreground">Run GPU workloads on a K8s configured cluster. This is the default.</p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 border rounded-md p-4 ${computeEnv === 'vm' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="vm" id="vm" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="vm" className="font-medium">Virtual Machine</Label>
                <p className="text-sm text-muted-foreground">Access a VM configured cluster to run workloads. (Coming soon)</p>
              </div>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Number of GPUs</Label>
                <p className="text-sm text-muted-foreground">You can add more later.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-8 text-center font-medium">{gpuCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGpuCount(Math.max(1, gpuCount - 1))}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGpuCount(gpuCount + 1)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Wallpaper Tinting</Label>
              <p className="text-sm text-muted-foreground">Allow the wallpaper to be tinted.</p>
            </div>
            <Switch checked={wallpaperTinting} onCheckedChange={setWallpaperTinting} />
          </div>

          <div className={`flex items-center space-x-2 border rounded-md p-4 ${termsAccepted ? 'bg-primary/10 border-primary' : ''}`}>
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms" className="font-medium">I agree to the terms and conditions</Label>
          </div>

          <div className="space-y-2">
            <Label>Price Range</Label>
            <p className="text-sm text-muted-foreground">Set your budget range ($200 - 800).</p>
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </Example>
  )
}

function ItemExample() {
  return (
    <Example title="Item">
      <Card className="w-full max-w-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-factor authentication</h4>
              <p className="text-sm text-muted-foreground">Verify via email or phone number.</p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <PackageIcon className="h-5 w-5 text-muted-foreground" />
            <span>Your order has been shipped.</span>
          </div>
        </CardContent>
      </Card>
    </Example>
  )
}

function ButtonGroupExample() {
  return (
    <Example title="Button Group">
      <Card className="w-full max-w-md">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon">
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="flex">
              <Button variant="outline">Archive</Button>
              <Button variant="outline">Report</Button>
              <Button variant="outline">
                Snooze
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <Button variant="outline" size="icon">
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex">
              <Button variant="outline">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
            </div>
            <Button variant="outline">
              Follow
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline">
              <span className="mr-1">🤖</span>
              Copilot
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Example>
  )
}

function EmptyExample() {
  return (
    <Example title="Empty">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="flex -space-x-3 mb-4">
            <Avatar className="h-12 w-12 border-2 border-background !rounded-full overflow-hidden">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" className="object-cover grayscale rounded-full" />
              <AvatarFallback className="rounded-full">U1</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12 border-2 border-background !rounded-full overflow-hidden">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" className="object-cover grayscale rounded-full" />
              <AvatarFallback className="rounded-full">U2</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12 border-2 border-background !rounded-full overflow-hidden">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" className="object-cover grayscale rounded-full" />
              <AvatarFallback className="rounded-full">U3</AvatarFallback>
            </Avatar>
          </div>
          <h4 className="font-semibold">No Team Members</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Invite your team to collaborate on this project.
          </p>
          <div className="flex gap-2">
            <Button variant="outline">Show Dialog</Button>
            <Button>Connect Mouse</Button>
          </div>
        </CardContent>
      </Card>
    </Example>
  )
}

function InputGroupExample() {
  return (
    <Example title="Input Group">
      <Card className="w-full max-w-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center border rounded-md">
            <div className="px-3 text-muted-foreground">
              <SearchIcon className="h-4 w-4" />
            </div>
            <Input className="border-0 focus-visible:ring-0" placeholder="Search..." />
            <span className="px-3 text-sm text-muted-foreground">12 results</span>
          </div>

          <div className="flex items-center border rounded-md">
            <span className="px-3 text-sm text-muted-foreground">https://</span>
            <Input className="border-0 focus-visible:ring-0" placeholder="example.com" />
            <Button variant="ghost" size="icon" className="mr-1">
              <GlobeIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="ml-1">
              <GlobeIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">https://</span>
            <Input className="border-0 focus-visible:ring-0" placeholder="" />
            <Button variant="ghost" size="icon" className="mr-1">
              <StarIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="ml-1">
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Input className="border-0 focus-visible:ring-0" placeholder="Send a message..." />
            <Button variant="ghost" size="icon" className="mr-1">
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="border rounded-md p-3">
            <Input className="border-0 focus-visible:ring-0 p-0 h-auto" placeholder="Ask, Search or Chat..." />
          </div>

          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="ml-1">
              <PlusIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm">Auto</span>
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground mr-2">52% used</span>
            <Button variant="ghost" size="icon" className="mr-1 text-primary">
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Example>
  )
}

function SheetExample() {
  return (
    <Example title="Sheet">
      <div className="flex gap-2 flex-wrap justify-center w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Top</Button>
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              <SheetTitle>Sheet from Top</SheetTitle>
              <SheetDescription>This sheet slides in from the top.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Right</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Sheet from Right</SheetTitle>
              <SheetDescription>This sheet slides in from the right.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Sheet from Bottom</SheetTitle>
              <SheetDescription>This sheet slides in from the bottom.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Left</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Sheet from Left</SheetTitle>
              <SheetDescription>This sheet slides in from the left.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </Example>
  )
}

function BadgeExample() {
  return (
    <Example title="Badge">
      <div className="flex gap-2 flex-wrap justify-center w-full">
        <Badge variant="default">
          <RefreshCwIcon className="h-3 w-3 mr-1 animate-spin" />
          Syncing
        </Badge>
        <Badge variant="secondary">
          <LoaderIcon className="h-3 w-3 mr-1 animate-spin" />
          Updating
        </Badge>
        <Badge variant="outline">
          <LoaderIcon className="h-3 w-3 mr-1 animate-spin" />
          Loading
        </Badge>
        <Badge variant="outline">
          <LinkIcon className="h-3 w-3 mr-1" />
          Link
        </Badge>
      </div>
    </Example>
  )
}
