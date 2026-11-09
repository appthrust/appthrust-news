// Package content contains the release-versioned AppThrust News source tree.
package content

import "embed"

//go:embed all:news
var Files embed.FS
