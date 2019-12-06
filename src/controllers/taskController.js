const Task = require('../models/taskModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createTask = catchAsync(async (req, res, next) => {
    const newTask = await Task.create({ ...req.body, user: req.user._id });

    res.status(201).json({
        status: 'success',
        data: {
            task: newTask,
        },
    });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
    const tasks = await Task.find({ user: req.user._id });

    res.status(200).json({
        status: 'success',
        result: tasks.length,
        data: {
            tasks,
        },
    });
});

exports.getTask = catchAsync(async (req, res, next) => {
    const task = await Task.findOne({ user: req.user._id, _id: req.params.id });

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            task,
        },
    });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        {
            new: true,
            runValidators: true,
        },
    );

    if (!updatedTask) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            task: updatedTask,
        },
    });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
    const taskToDelete = await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!taskToDelete) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
