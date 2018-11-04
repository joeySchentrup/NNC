from __future__ import print_function, division

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from torch.autograd import Variable
from PIL import Image
import numpy as np
import torchvision
from torchvision import datasets, models, transforms
import matplotlib.pyplot as plt
import time
import os
import copy
import sys

loader = transforms.Compose([transforms.ToTensor()])
use_gpu = torch.cuda.is_available()

def check_data(model, data):
    model.train(False)  # Set model to evaluate mode

    # forward
    outputs = model(data)
    _, preds = torch.max(outputs.data, 1)
    
    preds_str = str(preds)
    preds_str = preds_str.strip()
    index = preds_str.index("[")
    return preds_str[index + 1]

loader = transforms.Compose([
    transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])]) 

def image_loader(image_name):
    image = Image.open(image_name)
    image = Variable(loader(image))
    # fake batch dimension required to fit network's input dimensions
    image = image.unsqueeze(0)
    return image

#This may need to be edited to take in specfic model
model_ft = torch.load("./models/model.out")
image = image_loader(sys.argv[1])

if use_gpu:
    model_ft = model_ft.cuda()
    image = image.cuda()

print(check_data(model_ft, image))
sys.stdout.flush()
