import {
	CreateTaskRequest,
	UpdateTaskRequest,
	DeleteTaskRequest,
	FieldType
} from '$lib/stubs/task/v1beta/task';
import { toPb } from '$src/lib/helper/taskDto';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	newTask: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const fields = data.get('fields') as any;
		const dueDate = data.get('dueDate') as string;

		try {
			const [time, date] = dueDate.split(' ', 2);
			const [hour, minute] = time.split(':', 2);
			const [year, month, day] = date.split('-', 3);
			const createTaskRequest = CreateTaskRequest.create({
				task: toPb({ fields, name, dueDate: new Date(+year, +month - 1, +day, +hour, +minute) })
			});
			await locals.taskClient.createTask(createTaskRequest);

			return { success: 200 };
		} catch (error: any) {
			console.error(error);
			return fail(400, { error: error?.message || 'something went wront' });
		}
	},

	addField: async ({ request, locals }) => {
		const data = await request.formData();
		const taskName = data.get('taskName') as string;
		const fieldName = data.get('fieldName') as string;
		const fieldValue = data.get('fieldValue') as string;

		try {
			await locals.fieldClient.addField({
				fieldName,
				fieldValue,
				fieldType: FieldType.STRING,
				taskName
			});

			return { success: true };
		} catch (error: any) {
			console.error(error);
			return fail(400, { error: error?.message || 'something went wront' });
		}
	},
	removeTask: async ({ request, locals }) => {
		const data = await request.formData();
		const taskName = data.get('taskName') as string;
		const fieldName = data.get('fieldName') as string;

		try {
			await locals.fieldClient.removeField({
				fieldName,
				taskName
			});

			return { success: true };
		} catch (error: any) {
			console.error(error);
			return fail(400, { error: error?.message || 'something went wront' });
		}
	},

	updateTask: async ({ request, locals }) => {
		const data = await request.formData();
		const stringTask = data.get('task') as string;

		try {
			const updateTaskRequest = UpdateTaskRequest.create({
				task: toPb(JSON.parse(stringTask))
			});
			await locals.taskClient.updateTask(updateTaskRequest);

			return { success: true };
		} catch (error: any) {
			console.error(error);
			return fail(400, { error: error?.message || 'something went wront' });
		}
	},

	deleteTask: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name') as any;

		try {
			const deleteTaskRequest = DeleteTaskRequest.create({
				name
			});
			await locals.taskClient.deleteTask(deleteTaskRequest);

			return { success: true };
		} catch (error: any) {
			console.error(error);
			return fail(400, { error: error?.message || 'something went wront' });
		}
	}
};
