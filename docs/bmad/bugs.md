# 🐛 BUG TRACKER

**Project**: GangRun Printing
**Last Updated**: 2025-10-19
**Status**: Living Document

---

## 📊 Bug Statistics

- **Total Bugs**: 1
- **Critical**: 0
- **High**: 0
- **Medium**: 0
- **Low**: 0
- **Resolved**: 1

---

## 🔴 Critical Bugs

*Bugs that cause system crashes, data loss, or complete feature failure*

---

## 🟠 High Priority Bugs

*Bugs that significantly impact functionality but have workarounds*

---

## 🟡 Medium Priority Bugs

*Bugs that cause minor inconvenience but don't block core functionality*

---

## 🟢 Low Priority Bugs

*Cosmetic issues or minor annoyances*

---

## ✅ Resolved Bugs

*Historical record of fixed bugs*

### BUG-001: Cart Page Returns 500 Error - Invalid revalidate export in Client Component

**Severity**: High
**Status**: Resolved
**Reported**: 2025-10-19
**Resolved**: 2025-10-19

#### Description
The newly created cart page (`/cart`) was returning a 500 Internal Server Error instead of rendering properly. The error was caused by incompatible route segment config exports (`dynamic` and `revalidate`) in a client component.

#### Steps to Reproduce
1. Navigate to https://gangrunprinting.com/cart
2. Page returned 500 error
3. Docker logs showed: "Invalid revalidate value... must be a non-negative number or false"

#### Expected Behavior
Cart page should load with empty cart state or display cart items.

#### Actual Behavior
500 Internal Server Error with message:
```
Invalid revalidate value "function(){throw Error("Attempted to call revalidate() from the server but revalidate is on the client...")}" on "/cart"
```

#### Environment
- Platform: Docker (production)
- Next.js: 15.5.2
- Port: 3020 (external) / 3002 (internal)

#### Root Cause
In Next.js 15 with App Router, client components (`'use client'`) cannot export route segment config like `export const dynamic = 'force-dynamic'` or `export const revalidate = 0`. These exports only work in Server Components. The cart page was a client component (needed for React hooks like useState, useRouter, useCart) but had these server-only exports at lines 18-19.

#### Fix Applied
Removed incompatible exports from `/src/app/(customer)/cart/page.tsx`:
- Removed: `export const dynamic = 'force-dynamic'`
- Removed: `export const revalidate = 0`

Client components in Next.js are always dynamically rendered by default, so the `dynamic` export was redundant. The `revalidate` export is not supported in client components.

#### Related Files
- `/src/app/(customer)/cart/page.tsx:18-19` (fix applied)

#### Related ADRs
- ADR-010: Dedicated Cart Page with Artwork Upload

#### Testing Done
- [x] Manual testing - Verified page loads with 200 status
- [x] Production testing - Tested at https://gangrunprinting.com/cart
- [x] Docker container restart - Verified new build deployed successfully
- [ ] Unit tests added - Not applicable (routing issue)
- [ ] Integration tests added - Future consideration
- [x] Regression testing - Confirmed checkout page still works (200 status)

---

## 📋 Bug Report Template

```markdown
### BUG-XXX: [Bug Title]

**Severity**: [Critical | High | Medium | Low]
**Status**: [New | In Progress | Resolved | Won't Fix]
**Reported**: YYYY-MM-DD
**Resolved**: YYYY-MM-DD (if applicable)

#### Description
[Clear description of the bug]

#### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

#### Expected Behavior
[What should happen]

#### Actual Behavior
[What actually happens]

#### Environment
- Browser/Device:
- OS:
- Version:

#### Error Messages
```
[Error logs or messages]
```

#### Root Cause
[Technical explanation if known]

#### Fix Applied
[Description of the fix]

#### Related Files
- `file/path/to/affected.ts`

#### Related ADRs
- ADR-XXX

#### Testing Done
- [ ] Manual testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Regression testing
```

---

**Maintained by**: Development Team
**Report Bugs To**: docs/bmad/bugs.md
