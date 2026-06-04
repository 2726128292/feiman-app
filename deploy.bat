@echo off
chcp 65001 >nul
echo ========================================
echo   费曼学习法 App - GitHub Pages 部署
echo ========================================
echo.

:: 检查远程仓库
for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set REMOTE_URL=%%a
if "%REMOTE_URL%"=="" (
    echo [错误] 未配置远程仓库！
    echo.
    echo 请按以下步骤操作：
    echo.
    echo   1. 打开浏览器访问 https://github.com/new
    echo   2. Repository name 填写: feiman-app
    echo   3. 选择 Private 或 Public（公开即可免费部署）
    echo   4. 不要勾选 Add a README file
    echo   5. 点击 Create repository
    echo   6. 创建后运行以下命令:
    echo.
    echo     git remote add origin https://github.com/你的GitHub用户名/feiman-app.git
    echo     deploy.bat
    echo.
    pause
    exit /b 1
)

echo 远程仓库: %REMOTE_URL%
echo.

echo [步骤 1/3] 构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 构建失败，请检查代码错误
    pause
    exit /b 1
)
echo 构建成功 ✓
echo.

echo [步骤 2/3] 提交并推送代码...
git add -A
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo 没有新更改需要提交
) else (
    git commit -m "update: $(date /t)"
)
git push origin main --force
if %errorlevel% neq 0 (
    echo [错误] 推送失败，请检查仓库权限或网络
    pause
    exit /b 1
)
echo 推送成功 ✓
echo.

echo [步骤 3/3] 部署到 GitHub Pages...
echo 使用 subtree 推送 dist 目录到 gh-pages 分支...
git subtree push --prefix dist origin gh-pages --force
if %errorlevel% neq 0 (
    echo.
    echo 首次部署可能需要安装 git-subtree...
    echo 正在尝试替代方案...
    
    :: 备用方案: 创建临时目录部署
    if exist _deploy_temp rmdir /s /q _deploy_temp
    mkdir _deploy_temp
    cd _deploy_temp
    git init >nul 2>&1
    git remote add origin %REMOTE_URL%
    git fetch origin gh-pages >nul 2>&1
    git checkout -b gh-pages origin/gh-pages 2>nul || git checkout --orphan -b gh-pages
    xcopy ..\dist\* .\ /E /Y /Q >nul 2>&1
    git add -A
    git commit -m "deploy: $(date /t)" --allow-empty
    git push origin gh-pages --force
    cd ..
    rmdir /s /q _deploy_temp
)
echo 部署成功 ✓
echo.
echo ================================================
echo   🎉 部署完成！
echo ================================================
echo.
echo 你的应用地址:
for %%a in (%REMOTE_URL%) do set REPO_PATH=%%~nxa
echo   https://%REPO_PATH:~19,-5%.github.io/feiman-app/
echo.
echo 首次部署需等待 1-3 分钟生效
echo 如未生效，请到仓库 Settings ^> Pages 确认:
echo   Source: gh-pages branch, root: /(或 /feiman-app)
echo.
pause
