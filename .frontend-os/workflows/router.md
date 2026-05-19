# Workflow Router

If user starts with slash command:
- load matching workflow
- load matching skills
- execute task
- run audit
- return final result

Workflow inference:
UI task -> new-ui
Redesign -> redesign-ui
Architecture -> nextjs-architecture
Animation -> animation-polish
Accessibility -> accessibility-audit
Performance -> fix-performance
Pre-merge / pre-release / before deploy -> pre-release
Final UI review only -> production-audit
