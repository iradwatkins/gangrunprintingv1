Price structure.  
base price \= (quantity \+(custom quantity)) x (Size \+ (Custom Size))+  
Addon \+ (base price x turn around time)

Quantity  
custom quantity \= quantity input.  
custom quantity can only be selected in quantities of 5000\. example 55,000; 60,000; 65,000; 70,000 there is a min and max set by admin.  
when creating the quantity. there is a quantity group. the quantity group is a group of quantities with one being the default. example 25,50,150,500,1000,2500,5000,10000 default is 5000\.  
low numbers will have a input values that can replace the number, this will be for numbers under 2500\. to use for the calucation. but the number will show.. example. the number might be 25 but the back end value input is 100 the value will be used instead of the frontend number. if the imput is emply it will use the setup number.  
example frontend. 25,50,150,500,1000,2500,5000,10000  
example backend. 25,50,(255 input used ),500,1000,2500,5000,10000 the price 150 number is showing but the 255 value is used for calucations.

Size  
custom size \= width x hidth inputs  
Width and Height Input create the custom size. they are dropdown when the custom size is selected from the dropdown in sizes.  
example of funtions. width \= 4 hidth \= 6 together that 4x6 value is 24\.  
size width x hidith can be added in .25 4, 4.25, 6, 6.25 . we will also put in the min and max height and width.

key point about addons  
note 1: the way addon display on frontend in is three differnet way.  
 addon in dropdown. 2\. addon assign to above dropdown 3\. addon assign to below drop down.

note 2: add on can be mandory for different products. example when creating a product the addon has a checkbox next to it to make it mandatory.  
addon can have sub addon  
example.  
Corner Rounding with a sub option Rounded Corners  
suboptions show when checkbox are click.
