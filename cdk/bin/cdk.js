"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CDK = __importStar(require("@aws-cdk/core"));
const app = new CDK.App();
class E2EStack extends CDK.Stack {
    constructor(parent, id) {
        super(parent, id, {
            tags: { aTag: "avalue" }
        });
    }
}
new E2EStack(app, "test-stack");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUVyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixNQUFNLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUU5QixZQUFtQixNQUFlLEVBQUUsRUFBVTtRQUM1QyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRTtZQUNoQixJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDO1NBQ3ZCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQUVELElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIENESyBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuY29uc3QgYXBwID0gbmV3IENESy5BcHAoKTtcblxuY2xhc3MgRTJFU3RhY2sgZXh0ZW5kcyBDREsuU3RhY2sge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXJlbnQ6IENESy5BcHAsIGlkOiBzdHJpbmcpe1xuICAgIHN1cGVyKHBhcmVudCwgaWQsIHtcbiAgICAgIHRhZ3M6IHthVGFnOiBcImF2YWx1ZVwifVxuICAgIH0pO1xuICB9XG59XG5cbm5ldyBFMkVTdGFjayhhcHAsIFwidGVzdC1zdGFja1wiKTtcbiJdfQ==