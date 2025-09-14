# 🧪 COSMOSX IDE Preview System Test Checklist

## ✅ **BASIC FUNCTIONALITY TESTS**

### 1. Preview Button Activation
- [ ] Preview button exists in header
- [ ] Preview button responds to clicks
- [ ] Preview button shows loading state
- [ ] Tab switches to preview when clicked

### 2. Preview Tab Structure
- [ ] Preview tab exists in editor tabs
- [ ] Preview tab content loads properly
- [ ] Preview container has proper structure
- [ ] Preview controls are visible

### 3. Story Loading
- [ ] Test story loads without errors
- [ ] AST parsing works correctly
- [ ] Start scene is found and loaded
- [ ] Variables are initialized properly

## ✅ **ENGINE INTEGRATION TESTS**

### 4. CosmosEngine Integration
- [ ] Engine creates from AST successfully
- [ ] Engine starts with 'start' scene
- [ ] Engine state management works
- [ ] Variable interpolation works

### 5. CosmosUI Integration
- [ ] UI renders from engine state
- [ ] Text blocks display correctly
- [ ] Choices are rendered properly
- [ ] State updates reflect in UI

## ✅ **INTERACTIVITY TESTS**

### 6. Choice Navigation
- [ ] Clicking choices navigates to new scenes
- [ ] Scene transitions work smoothly
- [ ] State persists across scene changes
- [ ] Variables update correctly

### 7. Conditional Logic
- [ ] If statements work correctly
- [ ] Boolean conditions evaluate properly
- [ ] Different paths based on conditions
- [ ] Variable-based conditions work

### 8. Dice Rolling
- [ ] [ROLL 1d6] generates random numbers
- [ ] [ROLL 2d6] works correctly
- [ ] [ROLL_RESULT] is accessible in conditions
- [ ] Dice results affect story flow

## ✅ **VARIABLE SYSTEM TESTS**

### 9. Variable Assignment
- [ ] `set` statements work
- [ ] Variables update in real-time
- [ ] Variable interpolation `{variable}` works
- [ ] Variables persist across scenes

### 10. Stats System
- [ ] Stats are initialized correctly
- [ ] Stats can be modified
- [ ] Stats affect conditional logic
- [ ] Stats display in UI

### 11. Inventory System
- [ ] Inventory items are tracked
- [ ] Items can be added/removed
- [ ] Inventory affects story logic
- [ ] Inventory displays correctly

## ✅ **REAL-TIME UPDATE TESTS**

### 12. Live Preview Updates
- [ ] Changes in editor update preview
- [ ] Debounced updates work (500ms)
- [ ] No excessive re-rendering
- [ ] Performance is acceptable

### 13. Error Handling
- [ ] Invalid syntax shows errors
- [ ] Missing scenes show errors
- [ ] Engine errors are caught
- [ ] UI errors are handled gracefully

## ✅ **UI/UX TESTS**

### 14. Preview Controls
- [ ] Play button works
- [ ] Pause button works
- [ ] Restart button works
- [ ] Step button works
- [ ] Fullscreen button works

### 15. Preview Panels
- [ ] Stats panel displays correctly
- [ ] Inventory panel shows items
- [ ] Variables panel shows state
- [ ] Log panel shows history

### 16. Responsive Design
- [ ] Preview works on different screen sizes
- [ ] Text is readable
- [ ] Choices are clickable
- [ ] Layout adapts properly

## ✅ **PERFORMANCE TESTS**

### 17. Loading Performance
- [ ] Preview loads quickly
- [ ] Large stories don't freeze
- [ ] Memory usage is reasonable
- [ ] No memory leaks

### 18. Update Performance
- [ ] Real-time updates are smooth
- [ ] No lag when typing
- [ ] Scene transitions are fast
- [ ] Choice responses are immediate

## ✅ **INTEGRATION TESTS**

### 19. Debug Panel Integration
- [ ] Debug panel shows preview info
- [ ] Engine diagnostics work
- [ ] Performance metrics are tracked
- [ ] Error logging works

### 20. Asset Integration
- [ ] Images display correctly (if any)
- [ ] Audio plays properly (if any)
- [ ] Video shows correctly (if any)
- [ ] Asset paths resolve properly

## 🎯 **TEST SCENARIOS**

### Scenario 1: Basic Navigation
1. Load test story
2. Click "Enter the forest"
3. Click "Search for a weapon"
4. Verify dice roll works
5. Continue through story

### Scenario 2: Variable Testing
1. Start story
2. Check inventory
3. Search for weapon
4. Verify variables update
5. Check stats increase

### Scenario 3: Conditional Logic
1. Start without weapon
2. Try to challenge guardian
3. Verify different path
4. Get weapon and try again
5. Verify different outcome

### Scenario 4: Complex Interactions
1. Follow full story path
2. Test all conditional branches
3. Verify state persistence
4. Test all dice rolls
5. Check final score

## 🚨 **KNOWN ISSUES TO CHECK**

- [ ] No duplicate autocomplete registrations
- [ ] No console errors during preview
- [ ] No memory leaks
- [ ] No performance issues
- [ ] All features work as expected

## 📊 **SUCCESS CRITERIA**

- ✅ All basic functionality works
- ✅ All interactive features work
- ✅ Performance is acceptable
- ✅ No critical errors
- ✅ User experience is smooth
- ✅ All COSLANG features are supported
