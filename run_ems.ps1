$java = (Get-Command java).Source
$java_home = Split-Path (Split-Path $java)
$env:JAVA_HOME = $java_home
Write-Host "Using JAVA_HOME: $java_home"
.\mvnw.cmd spring-boot:run
