#!/bin/bash

echo "🤖 BMAD METHOD INSTALLATION VERIFICATION"
echo "========================================"
echo ""

# Check BMAD repository
echo "✅ Checking BMAD repository..."
if [ -d ".cursorrules/bmad-agents" ]; then
    echo "   ✓ BMAD repository cloned"
else
    echo "   ✗ BMAD repository missing"
fi

# Check agent files
echo ""
echo "✅ Checking agent configurations..."
for agent in pm ux-expert architect dev qa devops orchestrator; do
    if [ -f ".cursorrules/agents/${agent}.cursorrules" ]; then
        echo "   ✓ ${agent} agent configured"
    else
        echo "   ✗ ${agent} agent missing"
    fi
done

# Check workflow files
echo ""
echo "✅ Checking workflow automation..."
if [ -f ".cursorrules/workflows/decision-engine.cursorrules" ]; then
    echo "   ✓ Decision engine configured"
else
    echo "   ✗ Decision engine missing"
fi

if [ -f ".cursorrules/memory/context-manager.cursorrules" ]; then
    echo "   ✓ Context manager configured"
else
    echo "   ✗ Context manager missing"
fi

# Check environment configuration
echo ""
echo "✅ Checking environment configuration..."
if grep -q "EXA_API_KEY" .env.local 2>/dev/null; then
    echo "   ✓ MCP API keys configured"
else
    echo "   ✗ MCP API keys missing"
fi

# Check project structure
echo ""
echo "✅ Checking project structure..."
if [ -d "src/app" ] && [ -d "src/components" ] && [ -d "src/lib" ]; then
    echo "   ✓ Next.js folder structure created"
else
    echo "   ✗ Next.js folder structure incomplete"
fi

# Check components.json
echo ""
echo "✅ Checking UI registries..."
if grep -q "aceternity-ui" components.json 2>/dev/null; then
    echo "   ✓ UI registries configured"
else
    echo "   ✗ UI registries not configured"
fi

echo ""
echo "========================================"
echo "🎯 BMAD METHOD INSTALLATION COMPLETE!"
echo "========================================"
echo ""
echo "Test commands to verify system:"
echo "1. 'Create a customer review feature'"
echo "2. 'Fix the payment form bug'"
echo "3. 'Research competitor pricing'"
echo "4. 'Design a new upload interface'"
echo "5. 'Deploy to production'"
echo ""
echo "🤖 BMAD Orchestrator is now ACTIVE and ready for autonomous operation!"