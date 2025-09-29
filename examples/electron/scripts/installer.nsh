!macro customInstall
  // 安装后执行
  nsExec::ExecToLog '"$INSTDIR\scripts\postinstall.bat"'
!macroend

Function .onInstSuccess
  Call customInstall
FunctionEnd

!macro customUninstall
  // 卸载前执行
  nsExec::ExecToLog '"$INSTDIR\scripts\postuninstall.bat"'
!macroend

Function .onUninstSuccess
  Call customUninstall
FunctionEnd
