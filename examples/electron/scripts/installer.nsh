; Custom NSIS include for WasomeCodeX to improve logging of uninstall/upgrade issues.
; This file is appended to the auto-generated script by electron-builder via `nsis.include`.
; Safe to remove if problems occur.
; NOTE: Keep logic minimal to avoid breaking the default flow.

!ifndef WCX_INSTALLER_NSH
!define WCX_INSTALLER_NSH
!define WCX_PRODUCT_NAME "WasomeCodeX"
!define WCX_DISPLAY_PREFIX_PATTERN "WasomeCodeX%" ; 模糊前缀匹配模式：以产品名开头即可（后面任何版本号/后缀）

!define LOG_BASENAME "WasomeCodeX\\installer-uninstall.log"
Var LogFilePath  ; Variable to store full log path

Var wcxOldUninstallDir  ; Global variable to store old uninstall directory
Var wcxUninstallKeyHKCU ; Dynamic uninstall key name (HKCU)
Var wcxUninstallKeyHKLM ; Dynamic uninstall key name (HKLM)
Var wcxUninstallKeyHKCU_Alt ; Second match HKCU (if multiple)
Var wcxUninstallKeyHKLM_Alt ; Second match HKLM (if multiple)

Function wcx_WriteLog
  Exch $0
  Push $1
  StrCpy $LogFilePath "$LOCALAPPDATA\${LOG_BASENAME}"
  ClearErrors
  FileOpen $1 "$LogFilePath" a
  IfErrors skip_write
    FileSeek $1 0 END
    FileWrite $1 "$0$\r$\n"
    FileClose $1
  skip_write:
  Pop $1
  Pop $0
FunctionEnd

; Simple string contains check (replacement for StrStr)
; Usage: Push "haystack", Push "needle", Call wcx_StrContains, Pop $result
; Returns: needle if found, empty string if not found
Function wcx_StrContains
  Exch $R0 ; needle
  Exch
  Exch $R1 ; haystack
  Push $R2
  Push $R3
  Push $R4
  
  StrLen $R2 $R0 ; needle length
  StrLen $R3 $R1 ; haystack length
  
  StrCpy $R4 0
  wcx_StrContains_loop:
    IntCmp $R4 $R3 wcx_StrContains_notfound wcx_StrContains_notfound 0
    StrCpy $R5 $R1 $R2 $R4
    StrCmp $R5 $R0 wcx_StrContains_found
    IntOp $R4 $R4 + 1
    Goto wcx_StrContains_loop
  wcx_StrContains_found:
    StrCpy $R0 $R0
    Goto wcx_StrContains_end
  wcx_StrContains_notfound:
    StrCpy $R0 ""
  wcx_StrContains_end:
    Pop $R4
    Pop $R3
    Pop $R2
    Pop $R1
    Exch $R0
FunctionEnd

; Macro to be called from main script's .onInit
!macro customInit
  CreateDirectory "$LOCALAPPDATA\WasomeCodeX"
  StrCpy $LogFilePath "$LOCALAPPDATA\${LOG_BASENAME}"
  Push "========================================="
  Call wcx_WriteLog
  Push "[INSTALLER START] WasomeCodeX Installer"
  Call wcx_WriteLog
  Push "========================================="
  Call wcx_WriteLog
!macroend

Function wcx_LogEnvironment
  ; Save all registers we'll use
  Push $0
  Push $1
  Push $2
  Push $3
  Push $5
  Push $6
  Push $7
  Push $8
  Push $9
  Push $R0
  Push $R1
  Push $R2
  Push $R3
  Push $R4
  Push $R5
  Push $R8
  Push $R9
  
  Push "---------- ENVIRONMENT DIAGNOSTICS ----------"
  Call wcx_WriteLog
  
  ; Get timestamp
  nsExec::ExecToStack 'cmd /c echo %DATE% %TIME%'
  Pop $1
  Pop $0
  Push "[TIME] $0"
  Call wcx_WriteLog
  
  ; Get username
  ExpandEnvStrings $R9 "%USERNAME%"
  StrCmp $R9 "" wcxLogEnv_lblUserEmpty wcxLogEnv_lblUserOk
  wcxLogEnv_lblUserEmpty:
    StrCpy $R9 "(unknown)"
  wcxLogEnv_lblUserOk:
  Push "[USER] $R9"
  Call wcx_WriteLog
  Push "[INSTALLER] $EXEPATH"
  Call wcx_WriteLog
  Push "[TARGET DIR] $INSTDIR"
  Call wcx_WriteLog
  
  Push ""
  Call wcx_WriteLog
  Push "[REGISTRY CHECK] Searching for existing installations..."
  Call wcx_WriteLog

  ; Calculate product name length for prefix matching (supports DisplayName like "WasomeCodeX 1.64.0")
  StrLen $R8 "${WCX_PRODUCT_NAME}"
  
  ; --- Enumerate uninstall keys (HKCU) across 64-bit & 32-bit views ---
  StrCpy $wcxUninstallKeyHKCU ""
  StrCpy $wcxUninstallKeyHKCU_Alt ""
  Push "[REGISTRY] Enumerating HKCU uninstall keys for ${WCX_PRODUCT_NAME} (64-bit view first)" 
  Call wcx_WriteLog
  SetRegView 64
  StrCpy $R0 0
  wcxEnumHKCU64_Loop:
    EnumRegKey $R1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall" $R0
    IfErrors wcxEnumHKCU64_Done
    ReadRegStr $R2 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "DisplayName"
    StrCpy $R4 $R2 60
    Push "[REGISTRY][HKCU-64 scan] Key=$R1 DisplayName=$R4"
    Call wcx_WriteLog
    StrCpy $R7 $R2 $R8
    StrCmp $R7 "${WCX_PRODUCT_NAME}" wcxEnumHKCU64_PrefixMatch wcxEnumHKCU64_CheckHeuristic
    wcxEnumHKCU64_PrefixMatch:
      StrCmp $wcxUninstallKeyHKCU "" 0 wcxEnumHKCU64_SaveAlt
        StrCpy $wcxUninstallKeyHKCU $R1
        Push "[REGISTRY] HKCU-64 prefix match (${WCX_DISPLAY_PREFIX_PATTERN}): $wcxUninstallKeyHKCU"
        Call wcx_WriteLog
        Goto wcxEnumHKCU64_Next
      wcxEnumHKCU64_SaveAlt:
        StrCmp $wcxUninstallKeyHKCU_Alt "" 0 wcxEnumHKCU64_Next
        StrCpy $wcxUninstallKeyHKCU_Alt $R1
        Push "[REGISTRY] HKCU-64 secondary prefix match stored: $wcxUninstallKeyHKCU_Alt"
        Call wcx_WriteLog
        Goto wcxEnumHKCU64_Next
    wcxEnumHKCU64_CheckHeuristic:
      ; Fallback heuristic: check if UninstallString contains "Uninstall WasomeCodeX.exe"
      ReadRegStr $R3 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "UninstallString"
      StrCmp $R3 "" wcxEnumHKCU64_Next
      StrCmp $wcxUninstallKeyHKCU "" 0 wcxEnumHKCU64_Next
      ; Simple contains check: look for the uninstaller exe name in the path
      Push $R3
      Push "Uninstall WasomeCodeX.exe"
      Call wcx_StrContains
      Pop $R4
      StrCmp $R4 "" wcxEnumHKCU64_Next
        StrCpy $wcxUninstallKeyHKCU $R1
        Push "[REGISTRY] HKCU-64 heuristic match via UninstallString contains: $wcxUninstallKeyHKCU"
        Call wcx_WriteLog
    wcxEnumHKCU64_Next:
      IntOp $R0 $R0 + 1
      Goto wcxEnumHKCU64_Loop
  wcxEnumHKCU64_Done:
  ; If not found in 64-bit view, enumerate 32-bit view
  StrCmp $wcxUninstallKeyHKCU "" 0 wcxEnumHKCU_Finish
  Push "[REGISTRY] HKCU primary key not found in 64-bit view, trying 32-bit view" 
  Call wcx_WriteLog
  SetRegView 32
  StrCpy $R0 0
  wcxEnumHKCU32_Loop:
    EnumRegKey $R1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall" $R0
    IfErrors wcxEnumHKCU32_Done
    ReadRegStr $R2 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "DisplayName"
    StrCpy $R4 $R2 60
    Push "[REGISTRY][HKCU-32 scan] Key=$R1 DisplayName=$R4"
    Call wcx_WriteLog
    StrCpy $R7 $R2 $R8
    StrCmp $R7 "${WCX_PRODUCT_NAME}" wcxEnumHKCU32_PrefixMatch wcxEnumHKCU32_CheckHeuristic
    wcxEnumHKCU32_PrefixMatch:
      StrCmp $wcxUninstallKeyHKCU "" 0 wcxEnumHKCU32_SaveAlt
        StrCpy $wcxUninstallKeyHKCU $R1
        Push "[REGISTRY] HKCU-32 prefix match (${WCX_DISPLAY_PREFIX_PATTERN}): $wcxUninstallKeyHKCU"
        Call wcx_WriteLog
        Goto wcxEnumHKCU32_Next
      wcxEnumHKCU32_SaveAlt:
        StrCmp $wcxUninstallKeyHKCU_Alt "" 0 wcxEnumHKCU32_Next
        StrCpy $wcxUninstallKeyHKCU_Alt $R1
        Push "[REGISTRY] HKCU-32 secondary prefix match stored: $wcxUninstallKeyHKCU_Alt"
        Call wcx_WriteLog
        Goto wcxEnumHKCU32_Next
    wcxEnumHKCU32_CheckHeuristic:
      ReadRegStr $R3 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "UninstallString"
      StrCmp $R3 "" wcxEnumHKCU32_Next
      StrCmp $wcxUninstallKeyHKCU "" 0 wcxEnumHKCU32_Next
      Push $R3
      Push "Uninstall WasomeCodeX.exe"
      Call wcx_StrContains
      Pop $R4
      StrCmp $R4 "" wcxEnumHKCU32_Next
        StrCpy $wcxUninstallKeyHKCU $R1
        Push "[REGISTRY] HKCU-32 heuristic match via UninstallString contains: $wcxUninstallKeyHKCU"
        Call wcx_WriteLog
    wcxEnumHKCU32_Next:
      IntOp $R0 $R0 + 1
      Goto wcxEnumHKCU32_Loop
  wcxEnumHKCU32_Done:
  wcxEnumHKCU_Finish:
  ; Restore default view (use 64 so future explicit HKLM 64 reads consistent)
  SetRegView 64
  StrCmp $wcxUninstallKeyHKCU "" 0 wcxUseHKCUKey
    StrCpy $wcxUninstallKeyHKCU "${WCX_PRODUCT_NAME}"
    Push "[REGISTRY] HKCU dynamic key not found, fallback to fixed: ${WCX_PRODUCT_NAME}"
    Call wcx_WriteLog                                                                                           
  wcxUseHKCUKey:
  ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\$wcxUninstallKeyHKCU" "UninstallString"
  StrCmp $1 "" wcxLogEnv_hkcu_missing wcxLogEnv_hkcu_present
  wcxLogEnv_hkcu_missing:
    Push "[REGISTRY] HKCU: Not found"
    Call wcx_WriteLog
    Goto wcxLogEnv_after_hkcu
  wcxLogEnv_hkcu_present:
    Push "[REGISTRY] HKCU: Found"
    Call wcx_WriteLog
    Push "[REGISTRY]   Path: $1"
    Call wcx_WriteLog
  wcxLogEnv_after_hkcu:
  
  ; --- Enumerate uninstall keys (HKLM) across registry views ---
  StrCpy $wcxUninstallKeyHKLM ""
  StrCpy $wcxUninstallKeyHKLM_Alt ""
  Push "[REGISTRY] Enumerating HKLM uninstall keys for ${WCX_PRODUCT_NAME} (64-bit view first)" 
  Call wcx_WriteLog
  SetRegView 64
  StrCpy $R0 0
  wcxEnumHKLM64_Loop:
    EnumRegKey $R1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall" $R0
    IfErrors wcxEnumHKLM64_Done
    ReadRegStr $R2 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "DisplayName"
    StrCpy $R4 $R2 60
    Push "[REGISTRY][HKLM-64 scan] Key=$R1 DisplayName=$R4"
    Call wcx_WriteLog
    StrCpy $R7 $R2 $R8
    StrCmp $R7 "${WCX_PRODUCT_NAME}" wcxEnumHKLM64_PrefixMatch wcxEnumHKLM64_CheckHeuristic
    wcxEnumHKLM64_PrefixMatch:
      StrCmp $wcxUninstallKeyHKLM "" 0 wcxEnumHKLM64_SaveAlt
        StrCpy $wcxUninstallKeyHKLM $R1
        Push "[REGISTRY] HKLM-64 prefix match (${WCX_DISPLAY_PREFIX_PATTERN}): $wcxUninstallKeyHKLM"
        Call wcx_WriteLog
        Goto wcxEnumHKLM64_Next
      wcxEnumHKLM64_SaveAlt:
        StrCmp $wcxUninstallKeyHKLM_Alt "" 0 wcxEnumHKLM64_Next
        StrCpy $wcxUninstallKeyHKLM_Alt $R1
        Push "[REGISTRY] HKLM-64 secondary prefix match stored: $wcxUninstallKeyHKLM_Alt"
        Call wcx_WriteLog
        Goto wcxEnumHKLM64_Next
    wcxEnumHKLM64_CheckHeuristic:
      ReadRegStr $R3 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "UninstallString"
      StrCmp $R3 "" wcxEnumHKLM64_Next
      StrCmp $wcxUninstallKeyHKLM "" 0 wcxEnumHKLM64_Next
      Push $R3
      Push "Uninstall WasomeCodeX.exe"
      Call wcx_StrContains
      Pop $R4
      StrCmp $R4 "" wcxEnumHKLM64_Next
        StrCpy $wcxUninstallKeyHKLM $R1
        Push "[REGISTRY] HKLM-64 heuristic match via UninstallString contains: $wcxUninstallKeyHKLM"
        Call wcx_WriteLog
    wcxEnumHKLM64_Next:
      IntOp $R0 $R0 + 1
      Goto wcxEnumHKLM64_Loop
  wcxEnumHKLM64_Done:
  StrCmp $wcxUninstallKeyHKLM "" 0 wcxEnumHKLM_Finish
  Push "[REGISTRY] HKLM primary key not found in 64-bit view, trying 32-bit view" 
  Call wcx_WriteLog
  SetRegView 32
  StrCpy $R0 0
  wcxEnumHKLM32_Loop:
    EnumRegKey $R1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall" $R0
    IfErrors wcxEnumHKLM32_Done
    ReadRegStr $R2 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "DisplayName"
    StrCpy $R4 $R2 60
    Push "[REGISTRY][HKLM-32 scan] Key=$R1 DisplayName=$R4"
    Call wcx_WriteLog
    StrCpy $R7 $R2 $R8
    StrCmp $R7 "${WCX_PRODUCT_NAME}" wcxEnumHKLM32_PrefixMatch wcxEnumHKLM32_CheckHeuristic
    wcxEnumHKLM32_PrefixMatch:
      StrCmp $wcxUninstallKeyHKLM "" 0 wcxEnumHKLM32_SaveAlt
        StrCpy $wcxUninstallKeyHKLM $R1
        Push "[REGISTRY] HKLM-32 prefix match (${WCX_DISPLAY_PREFIX_PATTERN}): $wcxUninstallKeyHKLM"
        Call wcx_WriteLog
        Goto wcxEnumHKLM32_Next
      wcxEnumHKLM32_SaveAlt:
        StrCmp $wcxUninstallKeyHKLM_Alt "" 0 wcxEnumHKLM32_Next
        StrCpy $wcxUninstallKeyHKLM_Alt $R1
        Push "[REGISTRY] HKLM-32 secondary prefix match stored: $wcxUninstallKeyHKLM_Alt"
        Call wcx_WriteLog
        Goto wcxEnumHKLM32_Next
    wcxEnumHKLM32_CheckHeuristic:
      ReadRegStr $R3 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$R1" "UninstallString"
      StrCmp $R3 "" wcxEnumHKLM32_Next
      StrCmp $wcxUninstallKeyHKLM "" 0 wcxEnumHKLM32_Next
      Push $R3
      Push "Uninstall WasomeCodeX.exe"
      Call wcx_StrContains
      Pop $R4
      StrCmp $R4 "" wcxEnumHKLM32_Next
        StrCpy $wcxUninstallKeyHKLM $R1
        Push "[REGISTRY] HKLM-32 heuristic match via UninstallString contains: $wcxUninstallKeyHKLM"
        Call wcx_WriteLog
    wcxEnumHKLM32_Next:
      IntOp $R0 $R0 + 1
      Goto wcxEnumHKLM32_Loop
  wcxEnumHKLM32_Done:
  wcxEnumHKLM_Finish:
  SetRegView 64
  StrCmp $wcxUninstallKeyHKLM "" 0 wcxUseHKLMKey
    StrCpy $wcxUninstallKeyHKLM "${WCX_PRODUCT_NAME}"
    Push "[REGISTRY] HKLM dynamic key not found, fallback to fixed: ${WCX_PRODUCT_NAME}"
    Call wcx_WriteLog
  wcxUseHKLMKey:
  ReadRegStr $2 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$wcxUninstallKeyHKLM" "UninstallString"
  StrCmp $2 "" wcxLogEnv_hklm_missing wcxLogEnv_hklm_present
  wcxLogEnv_hklm_missing:
    Push "[REGISTRY] HKLM: Not found"
    Call wcx_WriteLog
    Goto wcxLogEnv_after_hklm
  wcxLogEnv_hklm_present:
    Push "[REGISTRY] HKLM: Found"
    Call wcx_WriteLog
    Push "[REGISTRY]   Path: $2"
    Call wcx_WriteLog
  wcxLogEnv_after_hklm:
  
  ; Decide which uninstall string to use for diagnostics ($5)
  Push ""
  Call wcx_WriteLog
  Push "[OLD VERSION CHECK] Analyzing installation path..."
  Call wcx_WriteLog
  
  StrCmp $1 "" wcxLogEnv_check_hklm wcxLogEnv_use_hkcu
  wcxLogEnv_use_hkcu:
    StrCpy $5 $1
    Push "[OLD VERSION] Using HKCU path"
    Call wcx_WriteLog
    Goto wcxLogEnv_derive_path
  wcxLogEnv_check_hklm:
    StrCmp $2 "" wcxLogEnv_derive_done wcxLogEnv_use_hklm
  wcxLogEnv_use_hklm:
    StrCpy $5 $2
    Push "[OLD VERSION] Using HKLM path"
    Call wcx_WriteLog
    Goto wcxLogEnv_derive_path
  wcxLogEnv_derive_path:
    ; Strip parameters from UninstallString (e.g., "/currentuser", "/allusers")
    ; Find first space followed by "/" to detect parameters
    StrCpy $7 $5
    StrLen $8 $7
    StrCpy $9 0   ; $9是一个索引位置
    wcxLogEnv_stripParams:
      ; If index ($9) >= length ($8) then no parameters found, jump to noParams
      IntCmp $9 $8 wcxLogEnv_noParams 0 0
      ; Otherwise extract two chars at position $9 and check for space + slash
      StrCpy $R0 $7 2 $9
      StrCmp $R0 " /" wcxLogEnv_foundParam 0
      IntOp $9 $9 + 1
      Goto wcxLogEnv_stripParams
    wcxLogEnv_foundParam:
      StrCpy $5 $7 $9
      Push "[OLD VERSION] Stripped parameters, path: $5"
      Call wcx_WriteLog
    wcxLogEnv_noParams:
    
    
    Push "[OLD VERSION] UninstallString raw: $5"
    Call wcx_WriteLog

    ; Robustly remove surrounding quotes from $5 if present.
    ; If first character is '"', strip it. Then if last character is '"', strip it.
    StrCpy $R0 $5 1 0
    StrCmp $R0 '"' wcxLogEnv_trim_start wcxLogEnv_no_trim
    wcxLogEnv_trim_start:
      ; remove leading quote: copy from index 1 to end
      StrCpy $5 $5 -1 1
      ; fall through to check end
    wcxLogEnv_no_trim:
    ; check last character
    StrCpy $R0 $5 1 -1
    StrCmp $R0 '"' wcxLogEnv_trim_end wcxLogEnv_trim_done
    wcxLogEnv_trim_end:
      StrLen $R1 $5
      IntOp $R1 $R1 - 1
      StrCpy $5 $5 $R1 0
    wcxLogEnv_trim_done:
    Push "[OLD VERSION] Uninstaller: $5"
    Call wcx_WriteLog
    
    ; Extract directory from uninstaller path
    StrLen $7 $5
    StrCpy $8 $5
    wcxLogEnv_wcxLoopFindDir:
      StrCmp $7 "0" wcxLogEnv_wcxDirFail
      IntOp $7 $7 - 1    ; 从字符串末尾开始向前查找
      StrCpy $9 $8 1 $7
      StrCmp $9 "\" wcxLogEnv_wcxFoundSlash wcxLogEnv_wcxLoopFindDir
      wcxLogEnv_wcxFoundSlash:
        StrCpy $6 $8 $7
        StrCpy $wcxOldUninstallDir $6  ; Save to global variable 安装目录
        Goto wcxLogEnv_wcxHaveDir
    wcxLogEnv_wcxDirFail:
      StrCpy $6 ""
      StrCpy $wcxOldUninstallDir ""
    wcxLogEnv_wcxHaveDir:
    StrCmp $6 "" wcxLogEnv_wcxNoDirDerived wcxLogEnv_wcxLogDir
    wcxLogEnv_wcxNoDirDerived:
      Push "[OLD VERSION] ERROR: Could not extract installation directory"
      Call wcx_WriteLog
      Goto wcxLogEnv_derive_done
    wcxLogEnv_wcxLogDir:
      Push "[OLD VERSION] Directory: $6"
      Call wcx_WriteLog
      IfFileExists "$6\Uninstall WasomeCodeX.exe" wcxLogEnv_wcxOldExeFound wcxLogEnv_wcxNoOldExe
      wcxLogEnv_wcxOldExeFound:
        Push "[OLD VERSION] Uninstaller executable verified"
        Call wcx_WriteLog
        Goto wcxLogEnv_wcxPermTest
      wcxLogEnv_wcxNoOldExe:
        Push "[OLD VERSION] WARNING: Uninstaller executable not found"
        Call wcx_WriteLog
        Goto wcxLogEnv_derive_done
    wcxLogEnv_wcxPermTest:
      ; Test write permissions
      ClearErrors
      FileOpen $R0 "$6\_wcx_perm_test.tmp" w
      IfErrors wcxLogEnv_wcxPermDenied wcxLogEnv_wcxPermWriteOk
      wcxLogEnv_wcxPermDenied:
        Push "[OLD VERSION] WARNING: No write permission to directory"
        Call wcx_WriteLog
        Goto wcxLogEnv_derive_done
      wcxLogEnv_wcxPermWriteOk:
        FileWrite $R0 "test"
        FileClose $R0
        Delete "$6\_wcx_perm_test.tmp"
        IfErrors wcxLogEnv_wcxPermDeleteFail wcxLogEnv_wcxPermDeleteOk
        wcxLogEnv_wcxPermDeleteFail:
          Push "[OLD VERSION] WARNING: Cannot delete temp file (directory locked?)"
          Call wcx_WriteLog
          Goto wcxLogEnv_derive_done
        wcxLogEnv_wcxPermDeleteOk:
          Push "[OLD VERSION] Write permissions OK"
          Call wcx_WriteLog
    wcxLogEnv_derive_done:
      
  ; List running processes
  Push ""
  Call wcx_WriteLog
  Push "[PROCESS CHECK] Scanning for running instances..."
  Call wcx_WriteLog
  
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq WasomeCodeX.exe" /NH /FO CSV'
  Pop $2
  Pop $3
  ; CSV output has quoted lines when a process matches, so check first char for '"'
  StrCpy $R0 $3 1
  StrCmp $R0 '"' wcxLogEnv_hasMainProcess wcxLogEnv_noMainProcess
  wcxLogEnv_hasMainProcess:
    Push "[PROCESS] WasomeCodeX.exe: RUNNING"
    Call wcx_WriteLog
    Goto wcxLogEnv_checkHelper
  wcxLogEnv_noMainProcess:
    Push "[PROCESS] WasomeCodeX.exe: Not running"
    Call wcx_WriteLog
    
  wcxLogEnv_checkHelper:
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq WasomeCodeX Helper.exe" /NH /FO CSV' ; electron 通常会有多个 helper 辅助进程
  Pop $2
  Pop $3
  StrCpy $R0 $3 1
  StrCmp $R0 '"' wcxLogEnv_hasHelperProcess wcxLogEnv_noHelperProcess
  wcxLogEnv_hasHelperProcess:
    Push "[PROCESS] WasomeCodeX Helper.exe: RUNNING"
    Call wcx_WriteLog
    Goto wcxLogEnv_end
  wcxLogEnv_noHelperProcess:
    Push "[PROCESS] WasomeCodeX Helper.exe: Not running"
    Call wcx_WriteLog
  
  wcxLogEnv_end:
  Push "---------------------------------------------"
  Call wcx_WriteLog
  Push ""
  Call wcx_WriteLog
  
  ; Restore all registers
  Pop $R9
  Pop $R8
  Pop $R5
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Pop $R0
  Pop $9
  Pop $8
  Pop $7
  Pop $6
  Pop $5
  Pop $3
  Pop $2
  Pop $1
  Pop $0
FunctionEnd

Section -wcxPreInstall
  ; Ensure log directory exists
  CreateDirectory "$LOCALAPPDATA\WasomeCodeX"
  
  Push ""
  Call wcx_WriteLog
  Push "========== PRE-INSTALL PHASE START =========="
  Call wcx_WriteLog
  Push "Installation Directory: $INSTDIR"
  Call wcx_WriteLog
  Push ""
  Call wcx_WriteLog
  
  Call wcx_LogEnvironment
  
  Push ""
  Call wcx_WriteLog
  Push "[CLEANUP] Checking for running instances..."
  Call wcx_WriteLog
  
  ; Re-check derived uninstall exe (use global variable)
  StrCpy $6 $wcxOldUninstallDir
  StrCmp $6 "" wcxPreInst_noOldVersion wcxPreInst_checkOldVersion
  
  wcxPreInst_checkOldVersion:
  IfFileExists "$6\Uninstall WasomeCodeX.exe" wcxPreInst_wcxProbeExist wcxPreInst_noOldVersion
  
  wcxPreInst_wcxProbeExist:
    Push "[CLEANUP] Found old version at: $6"
    Call wcx_WriteLog
    Push "[CLEANUP] Attempting silent uninstall of old version..."
    Call wcx_WriteLog
    nsExec::ExecToStack '"$6\Uninstall WasomeCodeX.exe" /S'
    Pop $R1
    Pop $R2
    Push "[CLEANUP] Uninstall exit code: $R1"
    Call wcx_WriteLog
    StrCmp $R1 "0" wcxPreInst_wcxProbeOk wcxPreInst_wcxProbeFail
    wcxPreInst_wcxProbeOk:
      Push "[CLEANUP] Old version uninstalled successfully"
      Call wcx_WriteLog
      Goto wcxPreInst_wcxAfterProbe
    wcxPreInst_wcxProbeFail:
      Push "[CLEANUP] WARNING: Old version uninstall returned error code: $R1"
      Call wcx_WriteLog
    wcxPreInst_wcxAfterProbe:
    Goto wcxPreInst_killProcesses
    
  wcxPreInst_noOldVersion:
    Push "[CLEANUP] No previous installation found"
    Call wcx_WriteLog
    
  wcxPreInst_killProcesses:
  Push ""
  Call wcx_WriteLog
  Push "[CLEANUP] Terminating running application processes..."
  Call wcx_WriteLog
  
  StrCpy $R3 0
  wcxPreInst_wcxLoopKill:
    IntCmp $R3 3 wcxPreInst_wcxKillFailed 0 0
    
    Push "[CLEANUP] Kill attempt $R3 of 3..."
    Call wcx_WriteLog
    
    nsExec::ExecToStack 'taskkill /IM WasomeCodeX.exe /T /F'
    Pop $2
    Pop $R7
    Push "[CLEANUP]   - WasomeCodeX.exe: exit code=$2"
    Call wcx_WriteLog
    
    nsExec::ExecToStack 'taskkill /IM "WasomeCodeX Helper.exe" /T /F'
    Pop $2
    Pop $R7
    Push "[CLEANUP]   - WasomeCodeX Helper.exe: exit code=$2"
    Call wcx_WriteLog
    
    Sleep 2000
    
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq WasomeCodeX.exe" /NH /FO CSV'
  Pop $R4
  Pop $R5

  ; CSV output is quoted when a match exists (e.g., "WasomeCodeX.exe",...),
  ; check first character for '"' to decide if the process is running.
  StrCpy $R0 $R5 1
  StrCmp $R0 '"' wcxPreInst_wcxStillRunning wcxPreInst_wcxKillDone
    
    wcxPreInst_wcxStillRunning:
      Push "[CLEANUP]   - Processes still running, waiting..."
      Call wcx_WriteLog
      IntOp $R3 $R3 + 1
      Goto wcxPreInst_wcxLoopKill
      
  wcxPreInst_wcxKillFailed:
    Push "[CLEANUP] WARNING: Failed to terminate processes after 3 attempts"
    Call wcx_WriteLog
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "WasomeCodeX is still running.$\n$\nPlease close all WasomeCodeX windows and click OK to retry." IDOK wcxPreInst_killProcesses IDCANCEL wcxPreInst_userAbort
        
  wcxPreInst_userAbort:
    Push "[CLEANUP] Installation aborted by user"
    Call wcx_WriteLog
    Abort "Installation cancelled: WasomeCodeX is still running."
      
  wcxPreInst_wcxKillDone:
    Push "[CLEANUP] All processes terminated successfully"
    Call wcx_WriteLog
  
  ; Final verification
  Push ""
  Call wcx_WriteLog
  Push "[VERIFY] Final system state check..."
  Call wcx_WriteLog
  
  ReadRegStr $3 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\$wcxUninstallKeyHKCU" "UninstallString"
  StrCmp $3 "" wcxPreInst_noHKCU wcxPreInst_hasHKCU
  wcxPreInst_hasHKCU:
    Push "[VERIFY] HKCU Registry: $3"
    Call wcx_WriteLog
    Goto wcxPreInst_checkHKLM
  wcxPreInst_noHKCU:
    Push "[VERIFY] HKCU Registry: Not found"
    Call wcx_WriteLog
    
  wcxPreInst_checkHKLM:
  ReadRegStr $4 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\$wcxUninstallKeyHKLM" "UninstallString"
  StrCmp $4 "" wcxPreInst_noHKLM wcxPreInst_hasHKLM
  wcxPreInst_hasHKLM:
    Push "[VERIFY] HKLM Registry: $4"
    Call wcx_WriteLog
    Goto wcxPreInst_finalCheck
  wcxPreInst_noHKLM:
    Push "[VERIFY] HKLM Registry: Not found"
    Call wcx_WriteLog
  
  wcxPreInst_finalCheck:
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq WasomeCodeX.exe" /NH /FO CSV'
  Pop $2 ; exit code
  Pop $3 ; last line output

  ; 检查是否以双引号开头（CSV 有内容说明进程存在）
  StrCpy $R0 $3 1
  StrCmp $R0 '"' wcxPreInst_hasProcess wcxPreInst_noProcess

  wcxPreInst_hasProcess:
    Push "[VERIFY] WARNING: WasomeCodeX.exe still running!"
    Call wcx_WriteLog
    Goto wcxPreInst_end

  wcxPreInst_noProcess:
    Push "[VERIFY] No WasomeCodeX processes running"
    Call wcx_WriteLog

    
  wcxPreInst_end:
  Push ""
  Call wcx_WriteLog
  Push "========== PRE-INSTALL PHASE COMPLETE =========="
  Call wcx_WriteLog
  Push ""
  Call wcx_WriteLog
SectionEnd

Section -wcxPostInstall
  Push ""
  Call wcx_WriteLog
  Push "========== POST-INSTALL PHASE =========="
  Call wcx_WriteLog
  Push "[SUCCESS] WasomeCodeX installation completed"
  Call wcx_WriteLog
  Push "[INFO] Installation path: $INSTDIR"
  Call wcx_WriteLog
  Push "[INFO] Executable: $INSTDIR\WasomeCodeX.exe"
  Call wcx_WriteLog
  Push "========================================="
  Call wcx_WriteLog
  Push ""
  Call wcx_WriteLog
SectionEnd

!endif ; WCX_INSTALLER_NSH

