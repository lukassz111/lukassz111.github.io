Remove-Item -Path ./docs -Recurse
Set-Location -Path ./page_src
npm run build
Set-Location -Path ./..
Copy-Item -Path ./page_src/src/.vuepress/dist -Destination ./docs -Recurse
