import { synchronize } from "./synchronize";

export default async function synchronizeCommand(): Promise<void> {
    synchronize(true);
}
