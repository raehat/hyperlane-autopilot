@echo off

rem Set up and deploy a Vercel project

rem Provide predefined responses to Vercel CLI prompts
cd..
cd hyperlane-warp-ui-template
echo y | vercel
echo.
echo n
echo lo
echo ./
echo n

rem Pause to keep the console window open
pause
