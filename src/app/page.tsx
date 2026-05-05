"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { LoginDialog } from "@/components/login-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  IconChevronDownFilled,
  IconChevronRight,
  IconMoon2,
  IconSun,
  IconTrendingUp2,
} from "@tabler/icons-react";
import {  useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
const contacts = [
  { id: 1, initials: "AR" },
  { id: 2, initials: "SC" },
  { id: 3, initials: "MJ" },
  { id: 4, initials: "ED" },
];
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
export default function Home() {
  const {data} = useSession();
  const { theme, setTheme } = useTheme();
  return (
    <main className="px-6 py-16 flex flex-col gap-4 max-w-md mx-auto">
      <div className="flex w-full items-end justify-between">
        <h1 className="font-display text-lg font-semibold leading-tight tracking-tighter">
          Aura
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
          >
            <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

            {/* Moon Icon (positioned absolutely on top) */}
            <IconMoon2 className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {
            data?.user ? (
              <Button variant={"default"}>Logout</Button>
            ) : (
              <LoginDialog>
                <Button variant={"default"}>Signup</Button>
              </LoginDialog>
            )
          }
          
        </div>
      </div>
      <h1 className="max-w-2xl text-lg text-foreground">
        Starting to get into shitty UI but will fix it later, as of now just
        focusing on functionality
      </h1>
      <p className="text-sm text-muted-foreground font-mono">
        Starting to get into shitty UI but will fix it later, as of now just
        focusing on functionality
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Button variant={"outline"}>Button</Button>
        <Button variant={"default"}>Button</Button>
        <Button variant={"secondary"}>Button</Button>
        <Button variant={"destructive"}>Button</Button>
        <Button variant={"ghost"}>Button</Button>
        <Button variant={"link"}>Button</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ButtonGroup>
          <Button size={"sm"} variant={"outline"}>
            Button
          </Button>

          <Button variant={"outline"} size={"icon-sm"}>
            <IconChevronDownFilled className="size-4" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button size={"sm"} variant={"default"}>
            Button
          </Button>

          <Button variant={"secondary"} size={"icon-sm"}>
            <IconChevronDownFilled className="size-4" />
          </Button>
        </ButtonGroup>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <p className="font-normal">Today&apos;s schedule</p>
          </CardTitle>
          <CardDescription>
            <p className="text-xs ">Here&apos;s what you have to do today</p>
          </CardDescription>
          <CardAction>
            <CardAction>
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2 items-center">
                  {contacts.map((contact) => (
                    <Avatar
                      key={contact.id}
                      className="size-7 border-2 border-background"
                    >
                      <AvatarFallback className="text-[10px]">
                        {contact.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <IconChevronRight className="size-4" />
              </div>
            </CardAction>
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <p className="font-xs">Study Hours</p>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="desktop"
                stroke="var(--color-desktop)"
                strokeWidth={2}
              />
              <Line
                dataKey="mobile"
                stroke="var(--color-mobile)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 items-start">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month{" "}
            <IconTrendingUp2 className="h-4 w-4 text-primary" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <p className="text-xs">Tell me something</p>
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <p className="text-sm">Something</p>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <p className="text-sm">Something</p>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <p className="text-sm">Something</p>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex w-full max-w-[420px] items-center gap-2">
        <Input type="email" placeholder="Email" />
        <Button type="submit">Subscribe</Button>
      </div>
    </main>
  );
}
