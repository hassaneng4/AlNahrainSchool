$WshShell = New-Object -comObject WScript.Shell
$sc = $WshShell.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'نظام اليسر للمبيعات.lnk'))
$sc.TargetPath = 'msedge.exe'
$sc.Arguments = '--new-window --app=C:\Users\user\Desktop\Al-Yusr-POS-V13-PRO\index_v12.html'
$sc.IconLocation = 'shell32.dll,43'
$sc.Save()
