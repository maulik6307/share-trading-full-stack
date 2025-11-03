# Infinite API Calls - Root Cause Analysis & Fixes

## 🚨 Issues Identified

### 1. **Infinite Loops in React Hooks**
**Root Cause:** Unstable dependency arrays causing continuous re-renders
- `addToast` function from useToast was changing on every render
- Object references in dependency arrays were not properly memoized
- `useCallback` dependencies included functions that changed frequently

### 2. **Strategy Not Found After Creation**
**Root Cause:** Race condition between strategy creation and immediate fetch
- Frontend redirects to builder page immediately after creation
- Strategy might not be immediately available in database
- No retry mechanism for newly created strategies

### 3. **Memoization Issues**
**Root Cause:** Objects recreated on every render
- Options objects passed to hooks were not stable
- Dependency arrays included unstable references
- JSON.stringify used incorrectly for memoization

## 🔧 Fixes Applied

### 1. **Stable Callback Hook**
```typescript
function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}
```

### 2. **Fixed useStrategies Hook**
- ✅ Removed `addToast` from dependency arrays
- ✅ Used `useStableCallback` for fetch functions
- ✅ Proper JSON.stringify for options memoization
- ✅ Stable references prevent infinite loops

### 3. **Fixed useStrategy Hook**
- ✅ Added proper null handling for empty ID
- ✅ Stable callback prevents re-renders
- ✅ Better error handling

### 4. **Fixed Strategy Builder Page**
- ✅ Added retry mechanism for newly created strategies
- ✅ Exponential backoff (1s, 2s, 3s delays)
- ✅ Better error messages with refresh option
- ✅ Stable options for recent strategies

### 5. **Fixed Template Hooks**
- ✅ Same stable callback pattern
- ✅ Removed toast dependencies from fetch functions
- ✅ Proper memoization

## 🎯 Key Changes Made

### Before (Problematic):
```typescript
const { addToast } = useToast();

const fetchStrategies = useCallback(async () => {
  // ... fetch logic
  addToast({ type: 'error', ... }); // This causes infinite loops!
}, [memoizedOptions, addToast]); // addToast changes every render
```

### After (Fixed):
```typescript
const fetchStrategies = useStableCallback(async () => {
  // ... fetch logic
  console.error('Error:', errorMessage); // Log instead of toast
});

useEffect(() => {
  fetchStrategies();
}, [stableOptions, fetchStrategies]); // Stable references
```

## 🧪 Testing Strategy

### 1. **API Call Monitoring**
- Created debug script to track API calls
- Detects infinite loops automatically
- Logs call frequency and patterns

### 2. **Strategy Creation Flow Test**
- Tests complete create → redirect → fetch flow
- Identifies race conditions
- Verifies data consistency

### 3. **Hook Stability Test**
- Monitors re-render frequency
- Checks dependency stability
- Validates memoization effectiveness

## 📊 Expected Results

### Before Fixes:
- ❌ 10+ API calls per page load
- ❌ Infinite loops on filter changes
- ❌ Strategy not found after creation
- ❌ UI freezing and poor performance

### After Fixes:
- ✅ 1-2 API calls per page load
- ✅ No infinite loops
- ✅ Strategies found after creation (with retry)
- ✅ Smooth UI performance

## 🚀 Deployment Checklist

- [x] Fixed all React hooks with stable callbacks
- [x] Removed toast dependencies from fetch functions
- [x] Added retry mechanism for strategy builder
- [x] Proper memoization for all options objects
- [x] Error logging instead of excessive toasts
- [x] Stable references in all dependency arrays

## 🔍 Monitoring

After deployment, monitor for:
1. **API call frequency** - Should be minimal
2. **Strategy creation success rate** - Should be 100%
3. **Page load performance** - Should be fast
4. **Error rates** - Should be low
5. **User experience** - Should be smooth

## 🎉 Benefits

1. **Performance**: Dramatically reduced API calls
2. **Reliability**: Strategies always found after creation
3. **User Experience**: No more UI freezing
4. **Maintainability**: Cleaner, more predictable code
5. **Debugging**: Better error logging and monitoring