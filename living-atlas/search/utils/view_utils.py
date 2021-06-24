from django.http import HttpResponse, JsonResponse

# All lemma keys are of the form {lemma}@{group}@.
# All form keys are of the form {lemma}@{group}@{form}
# and have value {group}@{form}.
# The "@" symbol will not appear in any other key,
# and the "@" symbol will only appear in the value if the
# checkbox corresponds to a form

def render_to_carto_response(request):

    json_data = {}

    for key in request.POST:
        if "@" not in key: 
            continue
        value = request.POST[key]
        if "@" not in value:
            continue
        group, form = value.split("@")
        # viking: json_data.setdefault() may be useful.
        if json_data.get(group):
            json_data[group].append(form)
        else:
            json_data[group] = [form]


    return JsonResponse(json_data, status=200)

# viking: imports go at the top of the file. See
# https://www.python.org/dev/peps/pep-0008/#imports
from openpyxl import Workbook

# viking: this is called directly from a view, which could impact the user
# experience negatively if it takes a long time (a few seconds) to complete.
def render_to_excel_response(request):

    response = HttpResponse()
    response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    response['Content-Disposition'] = f'attachment; filename=living-atlas.xlsx'

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "living-atlas-export"

    columns = {'form'  : 1, 
               'lemma' : 2, 
               'latin' : 3, 
               'group' : 4,}

    # Create the column names
    for col_name, col_idx in columns.items():
        cell = worksheet.cell(row = 1, column = col_idx)
        cell.value = col_name

    # Insert the row values
    row_idx = 2
    for key in request.POST:
        if len(key.split("@")) != 4:
            continue

        # viking: don't perform the split twice (stay DRY), assign it and
        # reference it twice, something like:
        #    data = key.split('@')
        #    if len(data) != 4:
        #        ...
        #    lemma, latin, group, form = data

        lemma, latin, group, form = key.split("@")
        row_values = {'form':form, 'lemma':lemma, 'latin':latin, 'group':group}

        for col_name, row_value in row_values.items():
            cell = worksheet.cell(row = row_idx, column = columns[col_name])
            cell.value = row_value
        row_idx += 1

    workbook.save(response)
    return response
