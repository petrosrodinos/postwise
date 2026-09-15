import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { GenerationRunsService } from '@/modules/generation-runs/generation-runs.service';
import { computeNextRun } from '@/shared/utils/automations/next-run.util';

@Injectable()
export class AutomationsCronService {
  private readonly logger = new Logger(AutomationsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generationRunsService: GenerationRunsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueAutomations() {
    const due = await this.prisma.automation.findMany({
      where: { is_active: true, next_run_at: { lte: new Date() } },
      include: { project: true },
    });

    for (const automation of due) {
      try {
        await this.generationRunsService.runForAutomation(automation);
      } catch (error) {
        this.logger.error(`Automation ${automation.id} failed to run: ${error.message}`);
      }

      const nextRunAt = computeNextRun({
        frequency: automation.frequency,
        days_of_week: automation.days_of_week,
        time_of_day: automation.time_of_day,
        timezone: automation.timezone,
      });

      await this.prisma.automation
        .update({
          where: { id: automation.id },
          data: { last_run_at: new Date(), next_run_at: nextRunAt },
        })
        .catch((error) =>
          this.logger.error(`Failed to reschedule automation ${automation.id}: ${error.message}`),
        );
    }
  }
}
