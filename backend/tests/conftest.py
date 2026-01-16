"""
Pytest configuration for DailyCook Backend Tests
"""
import pytest
import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))



@pytest.fixture
def anyio_backend():
    return 'asyncio'
