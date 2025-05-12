import amqp from 'amqplib';
import { RABBIT_MQ_CONFIG } from './helper_config';

export class RabbitMQHelper {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private channel_uri: string = RABBIT_MQ_CONFIG.URI as string;
    private channel_task: string = RABBIT_MQ_CONFIG.TASK as string;
    private channel_queue: string = RABBIT_MQ_CONFIG.QUEUE as string;

    /**
     * Connects to the RabbitMQ server and sends a task to the Celery queue.
     * @param {object} taskMessage - The task message to send to the queue.
     * @returns {Promise<any>}
     */
    public async sendTaskToRabbitMQ(taskMessage: object): Promise<any> {
        try {
            // Connect to RabbitMQ
            this.connection = await amqp.connect(this.channel_uri);
            this.channel = await this.connection.createChannel();

            const message = JSON.stringify({
                task: this.channel_task,
                args: [taskMessage],
                kwargs: {}
            });
            const success = this.channel.sendToQueue(this.channel_queue, Buffer.from(message), {
                contentType: 'application/json',
                contentEncoding: 'utf-8'
            });

            if (!success) {
                return { error: true, message: 'There is some problem to send data into queue.' };
            }
            // Close the channel and connection
            await this.channel.close();
            await this.connection.close();
            this.channel = null;
            this.connection = null;
            return { error: false, message: 'Message received successfully.' };
        } catch (error) {
            // Clean up on error
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }

            return { error: true, message: 'There is some problem to send data into queue.' };
        }
    }
}