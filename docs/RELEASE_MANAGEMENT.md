# Release Management Guide

This document explains how to create releases and manage versions for Ossining School Today.

## Overview

The application uses a semantic versioning system with integrated release notes that users can view directly in the app. Version information is centrally managed in `src/data/version.ts`.

## Version System

### Semantic Versioning
- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (X.Y.0)**: New features, significant improvements
- **Patch (X.Y.Z)**: Bug fixes, small improvements

### Codenames
Each release can have an optional codename that describes the release theme:
- `v2.1.0 "Offline-First"` - Focus on offline capabilities
- `v2.0.0 "Multilingual"` - Spanish language support
- `v1.0.0 "Foundation"` - Initial release

## Creating a New Release

### 1. Update Version Information

Edit `src/data/version.ts`:

```typescript
export const VERSION_INFO = {
  version: '2.2.0',          // New version number
  releaseDate: '2025-11-15',  // Release date
  codename: 'Enhanced',       // Optional codename
  buildNumber: Date.now()     // Automatically updated
}
```

### 2. Add Release Notes

Add a new entry to the top of the `RELEASE_NOTES` array:

```typescript
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2.2.0',
    date: '2025-11-15',
    codename: 'Enhanced',
    type: 'minor', // 'major', 'minor', or 'patch'
    features: [
      'New feature description',
      'Another cool feature'
    ],
    improvements: [
      'Performance enhancement',
      'UI polish'
    ],
    fixes: [
      'Fixed bug X',
      'Resolved issue Y'
    ]
  },
  // ... previous releases
]
```

### 3. Commit and Push

```bash
git add .
git commit -m "Release v2.2.0: Enhanced

- Feature 1
- Feature 2  
- Bug fixes"

git push origin main
```

### 4. Create GitHub Release (Optional)

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v2.2.0`
4. Title: `v2.2.0 "Enhanced"`
5. Description: Copy from release notes
6. Publish release

## User Experience

### Version Display
Users can view version information in several ways:

1. **Footer**: Shows current version string (e.g., `v2.1.0 "Offline-First"`)
2. **Release Notes Button**: Floating button in bottom-right corner
3. **Release Modal**: Full changelog with expandable release cards

### Features
- 📋 **Release Notes Modal**: Complete changelog with categorized changes
- 🚀 **Latest Badge**: Highlights the most recent release
- 🔧 **Type Indicators**: Visual badges for major/minor/patch releases
- 📅 **Release Dates**: Formatted dates for each release
- 🎨 **Color Coding**: Different colors for features, improvements, and fixes

## Best Practices

### When to Release

#### Major Releases (X.0.0)
- Breaking changes to API or user interface
- Complete feature overhauls
- New core functionality that changes how users interact with the app

#### Minor Releases (X.Y.0)
- New features that don't break existing functionality
- Significant improvements to existing features
- New integrations or capabilities

#### Patch Releases (X.Y.Z)
- Bug fixes
- Small UI improvements
- Performance optimizations
- Security updates

### Release Notes Guidelines

#### Features ✨
- Focus on user-facing benefits
- Use active voice ("Added widget caching" not "Widget caching was added")
- Be specific about what the feature does

#### Improvements 🔧
- Describe performance gains or UX enhancements
- Mention system-level improvements
- Include accessibility improvements

#### Fixes 🐛
- Be brief but clear about what was broken
- Focus on user impact, not technical details
- Group related fixes when possible

### Example Release Notes

```typescript
{
  version: '2.2.0',
  date: '2025-11-15',
  codename: 'Performance',
  type: 'minor',
  features: [
    'Added dark mode support with automatic system detection',
    'New widget customization options with color themes',
    'Bulk profile import from CSV files'
  ],
  improvements: [
    'Reduced app loading time by 40%',
    'Enhanced mobile responsiveness on small screens',
    'Improved accessibility with better keyboard navigation'
  ],
  fixes: [
    'Fixed widget generation failing on long student names',
    'Resolved timezone issues with menu display',
    'Corrected Spanish translation inconsistencies'
  ]
}
```

## Automation

### Automatic Deployment
- Vercel automatically deploys on push to `main`
- Version information is immediately available to users
- No additional deployment steps needed

### Build Number
- Automatically generated timestamp
- Useful for debugging and cache busting
- Updated each time version.ts is modified

## Troubleshooting

### Version Not Updating
1. Check that `VERSION_INFO` was updated correctly
2. Clear browser cache
3. Verify deployment completed on Vercel

### Release Notes Not Showing
1. Ensure new entry is at the top of `RELEASE_NOTES` array
2. Check for TypeScript compilation errors
3. Verify proper formatting of release note object

### Component Errors
1. Check console for React errors
2. Verify all required fields are present in release notes
3. Ensure proper TypeScript types are used

## Future Enhancements

### Planned Features
- [ ] Automatic version bumping from package.json
- [ ] Integration with GitHub releases API
- [ ] Notification system for major releases
- [ ] Release note previews in development
- [ ] Automated changelog generation from commit messages

### Ideas for Improvement
- In-app update notifications
- Release note email subscriptions
- Beta version management
- Rollback capabilities
- User feedback integration