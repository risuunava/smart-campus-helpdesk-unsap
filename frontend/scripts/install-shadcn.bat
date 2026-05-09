@echo off
echo ========================================
echo  Smart Campus Helpdesk UNSAP
echo  Instalasi shadcn/ui Components
echo ========================================
echo.

echo [1/4] Installing core dependencies...
call npm install clsx tailwind-merge tailwindcss-animate class-variance-authority lucide-react
echo.

echo [2/4] Installing Radix UI dependencies...
call npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip
echo.

echo [3/4] Installing form and table libraries...
call npm install react-hook-form @hookform/resolvers zod @tanstack/react-table date-fns recharts
echo.

echo [4/4] Installing shadcn/ui components...
call npx shadcn@latest add button
call npx shadcn@latest add card
call npx shadcn@latest add badge
call npx shadcn@latest add table
call npx shadcn@latest add form
call npx shadcn@latest add input
call npx shadcn@latest add textarea
call npx shadcn@latest add switch
call npx shadcn@latest add dialog
call npx shadcn@latest add toast
call npx shadcn@latest add skeleton
call npx shadcn@latest add tabs
call npx shadcn@latest add accordion
call npx shadcn@latest add alert-dialog
call npx shadcn@latest add avatar
call npx shadcn@latest add checkbox
call npx shadcn@latest add dropdown-menu
call npx shadcn@latest add label
call npx shadcn@latest add popover
call npx shadcn@latest add select
call npx shadcn@latest add separator
call npx shadcn@latest add sheet
call npx shadcn@latest add tooltip
call npx shadcn@latest add scroll-area
call npx shadcn@latest add progress
call npx shadcn@latest add data-table
echo.

echo ========================================
echo  INSTALASI SELESAI!
echo ========================================
echo.
echo Komponen yang terinstall:
echo    - button, card, badge, table
echo    - form, input, textarea, switch
echo    - dialog, toast, skeleton, tabs
echo    - accordion, alert-dialog, avatar
echo    - checkbox, dropdown-menu, label
echo    - popover, select, separator
echo    - sheet, tooltip, scroll-area
echo    - progress, data-table
echo.
pause