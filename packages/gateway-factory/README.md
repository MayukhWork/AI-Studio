# @ai3d/gateway-factory

Reusable provider-selection composition boundary.

`AiGatewayFactory.fromEnvironment()` reads `LLM_PROVIDER` and only the selected
provider's credential/model variables, then returns the existing `AiGateway`
interface. Application and execution layers never import provider plugins.
