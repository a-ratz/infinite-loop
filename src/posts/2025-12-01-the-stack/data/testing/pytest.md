---
name: pytest
status: Established
link: https://pytest.org/
why: Fixtures, parametrization, plugins
---

Python's standard library includes unittest. Python's standard practice is to use pytest instead.

The difference is philosophy. unittest says "tests are methods on classes that inherit from TestCase." pytest says "tests are functions that start with test_." The reduction in ceremony is dramatic. The improvement in readability is immediate. Your tests stop looking like Java cosplay and start looking like Python.

Fixtures replace setup/teardown with something far more powerful: injectable dependencies with configurable scope. Database connections, mock services, test data: define them once, inject them by name, let pytest handle the lifecycle. Parametrization turns one test into twenty with a decorator. The assert statement gets magical introspection that shows you exactly what failed and why.

The plugin ecosystem crosses 1,300 entries. Parallel execution, coverage reports, property-based testing, Django integration, async support. Whatever specialized testing need you have, someone probably built a pytest plugin for it.

Mozilla switched. Dropbox switched. They had unittest tests. Now they have pytest tests. The migration path exists, the benefits are clear, and honestly, life's too short for boilerplate.
