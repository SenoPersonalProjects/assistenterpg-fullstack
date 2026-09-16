param(
  [string]$SourcePath = "$PSScriptRoot\..\public\images\logos\logo-padrao-transparent.png",
  [string]$OutputDirectory = "$PSScriptRoot\..\public\icons",
  [string]$FaviconPath = "$PSScriptRoot\..\public\favicon.ico"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-IconBitmap {
  param(
    [System.Drawing.Image]$Source,
    [int]$Size
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($Source, (New-Object System.Drawing.Rectangle 0, 0, $Size, $Size))
    return $bitmap
  } finally {
    $graphics.Dispose()
  }
}

function Save-PngIcon {
  param(
    [System.Drawing.Image]$Source,
    [int]$Size,
    [string]$Destination
  )

  $bitmap = New-IconBitmap -Source $Source -Size $Size
  try {
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $bitmap.Dispose()
  }
}

function Write-Favicon {
  param(
    [System.Drawing.Image]$Source,
    [string]$Destination
  )

  $sizes = @(16, 32, 48, 64, 128, 256)
  $pngBytes = foreach ($size in $sizes) {
    $bitmap = New-IconBitmap -Source $Source -Size $size
    try {
      $stream = New-Object System.IO.MemoryStream
      try {
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        ,$stream.ToArray()
      } finally {
        $stream.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  }

  $stream = [System.IO.File]::Open($Destination, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
  $writer = New-Object System.IO.BinaryWriter $stream
  try {
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$sizes.Count)

    $offset = 6 + (16 * $sizes.Count)
    for ($index = 0; $index -lt $sizes.Count; $index++) {
      $size = $sizes[$index]
      $writer.Write([Byte]$(if ($size -eq 256) { 0 } else { $size }))
      $writer.Write([Byte]$(if ($size -eq 256) { 0 } else { $size }))
      $writer.Write([Byte]0)
      $writer.Write([Byte]0)
      $writer.Write([UInt16]1)
      $writer.Write([UInt16]32)
      $writer.Write([UInt32]$pngBytes[$index].Length)
      $writer.Write([UInt32]$offset)
      $offset += $pngBytes[$index].Length
    }

    foreach ($bytes in $pngBytes) {
      $writer.Write($bytes)
    }
  } finally {
    $writer.Dispose()
  }
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$source = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $SourcePath))
try {
  Save-PngIcon -Source $source -Size 180 -Destination (Join-Path $OutputDirectory 'maledicencia-180.png')
  Save-PngIcon -Source $source -Size 192 -Destination (Join-Path $OutputDirectory 'maledicencia-192.png')
  Save-PngIcon -Source $source -Size 512 -Destination (Join-Path $OutputDirectory 'maledicencia-512.png')
  Save-PngIcon -Source $source -Size 512 -Destination (Join-Path $OutputDirectory 'maledicencia-512-maskable.png')
  Write-Favicon -Source $source -Destination $FaviconPath
} finally {
  $source.Dispose()
}
