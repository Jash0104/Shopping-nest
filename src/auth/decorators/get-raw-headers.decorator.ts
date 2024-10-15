import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetRawHeaders = createParamDecorator(
    (data, context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest()
        return req.rawheaders
    }
)